import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../utils/api";
import "../styles/ARNavigator.css";

export default function ARNavigator() {
  const [navData, setNavData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const locationState = useLocation().state;
  const instituteId = locationState?.instituteId;
  const navigate = useNavigate();

  const sceneRef = useRef(null);
  const scriptsLoaded = useRef(false);

  useEffect(() => {
    if (!instituteId) {
      setError("Institute ID is missing");
      setLoading(false);
      return;
    }

    const loadScripts = async () => {
      try {
        // Check if scripts already loaded
        if (scriptsLoaded.current) return;
        
        // Load scripts with fallback URLs
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js");
        await loadScript("/libs/aframe.min.js");
        await loadScript("/libs/aframe-ar.min.js");
        
        scriptsLoaded.current = true;
        
        // Fetch navigation data
        const { data } = await api.get(`/institute/${instituteId}/nav-data`);
        setNavData(data);
        
      } catch (err) {
        console.error("Script loading error:", err);
        setError(`Failed to load AR libraries: ${err.message}`);
        setLoading(false);
      }
    };

    loadScripts();

    return () => {
      // Clean up AR scene
      if (sceneRef.current) {
        document.body.removeChild(sceneRef.current);
      }
    };
  }, [instituteId]);

  useEffect(() => {
    // Initialize scene ONLY after both scripts and data are ready
    if (navData && scriptsLoaded.current) {
      initARScene();
    }
  }, [navData]);

  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  };

  const initARScene = () => {
    // Create scene container
    const sceneContainer = document.createElement("div");
    sceneContainer.id = "scene-container";
    sceneRef.current = sceneContainer;
    document.body.appendChild(sceneContainer);

    // Initialize AR scene
    const scene = document.createElement("a-scene");
    scene.setAttribute("id", "scene");
    scene.setAttribute("vr-mode-ui", "enabled: false");
    scene.setAttribute(
      "arjs",
      "sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3; trackingMethod: best; sourceWidth: 1280; sourceHeight: 720; displayWidth: 1280; displayHeight: 720;"
    );
    scene.setAttribute(
      "renderer",
      "logarithmicDepthBuffer: true; precision: medium; antialias: true;"
    );
    scene.setAttribute("camera", "fov: 60;");

    // Add camera entity
    const camera = document.createElement("a-entity");
    camera.setAttribute("id", "camera");
    camera.setAttribute(
      "gps-camera",
      "gpsMinDistance: 5; gpsTimeInterval: 1000;"
    );
    camera.setAttribute("rotation-reader", "");
    camera.setAttribute("arjs-device-orientation-controls", "");
    scene.appendChild(camera);

    // Add assets
    const assets = document.createElement("a-assets");
    assets.innerHTML = `
      <a-asset-item id="arrow-obj" src="https://cdn.jsdelivr.net/gh/aframevr/assets@master/360-image-gallery-boilerplate/models/arrow/arrow.obj"></a-asset-item>
      <a-asset-item id="arrow-mtl" src="https://cdn.jsdelivr.net/gh/aframevr/assets@master/360-image-gallery-boilerplate/models/arrow/arrow.mtl"></a-asset-item>
    `;
    scene.appendChild(assets);

    sceneContainer.appendChild(scene);

    // Initialize navigation system
    setTimeout(() => {
      window.CAMPUS_NODES = navData.campusNodes;
      window.CAMPUS_PATHS = navData.campusPaths;
      window.DESTINATIONS = navData.destinations;
      initARNavigation();
    }, 1000);
  };

  const initARNavigation = () => {
    // Request permissions and initialize
    const init = async () => {
      try {
        // 1. Request location permission
        await requestLocationPermission();

        // 2. Request camera access
        const stream = await requestCameraPermission();

        // 3. Start GPS tracking
        startGPSTracking();

        // 4. Show UI elements
        document.querySelector(".arjs-loader")?.classList.add("hidden");
        document.getElementById("status-panel")?.classList.remove("hidden");
        document.getElementById("controls-panel")?.classList.remove("hidden");
        document.getElementById("compass")?.classList.remove("hidden");

        setPermissionsGranted(true);
        setLoading(false);
      } catch (err) {
        console.error("Permission error:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    init();
  };

  const requestLocationPermission = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => {
          const messages = {
            1: "Location permission denied",
            2: "Location unavailable",
            3: "Location request timeout",
          };
          reject(new Error(messages[error.code] || "Location error"));
        },
        { enableHighAccuracy: true, timeout: 15000 }
      );
    });
  };

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      const cameraFeed = document.getElementById("camera-feed");
      if (cameraFeed) {
        cameraFeed.srcObject = stream;
        document.getElementById("camera-container").classList.remove("hidden");
      }

      return stream;
    } catch (err) {
      throw new Error(`Camera access required: ${err.message}`);
    }
  };

  const startGPSTracking = () => {
    const options = {
      enableHighAccuracy: true,
      maximumAge: 2000,
      timeout: 10000,
    };

    watchId = navigator.geolocation.watchPosition(
      handlePositionUpdate,
      handlePositionError,
      options
    );

    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", handleOrientationUpdate);
    } else {
      setInterval(() => {
        userHeading = (userHeading + 2) % 360;
        updateCompass();
      }, 100);
    }
  };

  if (error) {
    return (
      <div className="error-container">
        <h2>Navigation Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/")}>Return Home</button>
      </div>
    );
  }

  if (loading || !navData) {
    return (
      <div className="ar-loader">
        <div className="spinner"></div>
        <p>Loading navigation system...</p>
        {!permissionsGranted && (
          <div className="permission-prompt">
            <p>This app requires camera and location access</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="ar-container">
      <div className="arjs-loader">
        <h1>🧭 Campus AR Path Navigator</h1>
        <div className="spinner"></div>
        <div id="loading-status">Initializing navigation system...</div>
        <div id="permission-status">
          {!permissionsGranted && "Waiting for permissions..."}
        </div>
      </div>

      <div id="ui-overlay">
        <button id="map-toggle">Show Campus Map</button>
        <button id="show-ui-btn" className="hidden">
          Show UI
        </button>

        <div id="camera-container" className="hidden">
          <video id="camera-feed" autoPlay muted playsInline></video>
        </div>

        <div id="status-panel" className="ui-panel hidden">
          <div id="distance-display">Select destination</div>
          <div id="direction-display"></div>
          <div id="instruction-display">Choose where you want to navigate</div>
          <div id="gps-info">
            <span className="status-dot status-poor"></span>
            <span id="gps-status-text">Acquiring GPS signal...</span>
          </div>
        </div>

        <div id="controls-panel" className="ui-panel hidden">
          <select id="destination-select">
            <option value="">🎯 Select Destination</option>
            <option value="main_gate">📚 Main Gate</option>
            <option value="library">📖 Library</option>
            <option value="cafeteria">🍔 Cafeteria</option>
            <option value="gym">🏋️‍♂️ Gym</option>
            <option value="auditorium">🎭 Auditorium</option>
          </select>

          <button id="navigate-btn" className="action-button" disabled>
            Start Navigation
          </button>

          <button id="stop-btn" className="action-button hidden">
            Stop Navigation
          </button>

          <button id="calibrate-btn" className="action-button">
            📱 Calibrate Compass
          </button>
        </div>

        <div id="compass" className="hidden">
          <div id="compass-needle"></div>
          <span>N</span>
        </div>

        <div id="map-overlay" className="hidden">
          <div id="map-title">Campus Map</div>
          <div id="campus-map"></div>
        </div>

        <div id="debug-panel">
          <div>
            <strong>Debug Information</strong>
          </div>
          <div id="debug-info">Loading...</div>
        </div>
      </div>

      <script src="../utils/ar-navigation.js"></script>
    </div>
  );
}
