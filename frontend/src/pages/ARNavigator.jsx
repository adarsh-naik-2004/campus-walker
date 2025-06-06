import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../utils/api";
import "../styles/ARNavigator.css";

export default function ARNavigator() {
  const [navData, setNavData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const locationState = useLocation().state;
  const instituteId = locationState?.instituteId;
  const navigate = useNavigate();

  // Refs for script elements
  const threeRef = useRef(null);
  const aframeRef = useRef(null);
  const arjsRef = useRef(null);

  useEffect(() => {
    if (!instituteId) {
      setError("Institute ID is missing");
      setLoading(false);
      return;
    }

    const loadScripts = async () => {
      try {
        // Dynamically load required scripts
        threeRef.current = document.createElement("script");
        threeRef.current.src =
          "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";

        aframeRef.current = document.createElement("script");
        aframeRef.current.src =
          "https://cdn.jsdelivr.net/npm/aframe@1.4.0/dist/aframe.min.js";

        arjsRef.current = document.createElement("script");
        arjsRef.current.src =
          "https://cdn.jsdelivr.net/npm/ar.js@3.4.5/dist/aframe-ar.min.js";

        document.body.appendChild(threeRef.current);
        document.body.appendChild(aframeRef.current);
        document.body.appendChild(arjsRef.current);

        // Fetch navigation data
        const { data } = await api.get(`/institute/${instituteId}/nav-data`);
        setNavData(data);
        setLoading(false);
      } catch (err) {
        console.error("Initialization error:", err);
        setError("Failed to load navigation system");
        setLoading(false);
      }
    };

    loadScripts();

    return () => {
      // Cleanup scripts
      if (threeRef.current) document.body.removeChild(threeRef.current);
      if (aframeRef.current) document.body.removeChild(aframeRef.current);
      if (arjsRef.current) document.body.removeChild(arjsRef.current);
    };
  }, [instituteId]);

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
      </div>
    );
  }

  return (
    <div className="ar-container">
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.CAMPUS_NODES = ${JSON.stringify(navData.campusNodes)};
            window.CAMPUS_PATHS = ${JSON.stringify(navData.campusPaths)};
            window.DESTINATIONS = ${JSON.stringify(navData.destinations)};
          `,
        }}
      />
        <div class="arjs-loader">
        <h1>🧭 Campus AR Path Navigator</h1>
        <div class="spinner"></div>
        <div id="loading-status">Initializing navigation system...</div>
        <div id="permission-status">Requesting location permissions...</div>
    </div>
    
    <a-scene 
        id="scene"
        vr-mode-ui="enabled: false"
        arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3; trackingMethod: best; sourceWidth: 1280; sourceHeight: 720; displayWidth: 1280; displayHeight: 720;"
        renderer="logarithmicDepthBuffer: true; precision: medium; antialias: true;"
        camera="fov: 60;"
    >
       
        <a-entity id="camera" gps-camera="gpsMinDistance: 5; gpsTimeInterval: 1000;" rotation-reader arjs-device-orientation-controls></a-entity>
        
        <a-assets>
           
            <a-asset-item id="arrow-obj" src="https://cdn.jsdelivr.net/gh/aframevr/assets@master/360-image-gallery-boilerplate/models/arrow/arrow.obj"></a-asset-item>
            <a-asset-item id="arrow-mtl" src="https://cdn.jsdelivr.net/gh/aframevr/assets@master/360-image-gallery-boilerplate/models/arrow/arrow.mtl"></a-asset-item>
        </a-assets>
    </a-scene>
    
    <div id="ui-overlay">
        <button id="map-toggle">Show Campus Map</button>
        <button id="show-ui-btn" class="hidden">Show UI</button>
        
        <div id="camera-container" class="hidden">
            <video id="camera-feed" autoplay muted playsinline></video>
        </div>
        
        <div id="status-panel" class="ui-panel hidden">
            <div id="distance-display">Select destination</div>
            <div id="direction-display"></div>
            <div id="instruction-display">Choose where you want to navigate</div>
            <div id="gps-info">
                <span class="status-dot status-poor"></span>
                <span id="gps-status-text">Acquiring GPS signal...</span>
            </div>
        </div>
        
        <div id="controls-panel" class="ui-panel hidden">
            <select id="destination-select">
                <option value="">🎯 Select Destination</option>
                <option value="main_gate">📚 Main Gate</option>
                <option value="library">📖 Library</option>
                <option value="cafeteria">🍔 Cafeteria</option>
                <option value="gym">🏋️‍♂️ Gym</option>
                <option value="auditorium">🎭 Auditorium</option>
            </select>
            
            <button id="navigate-btn" class="action-button" disabled>
                Start Navigation
            </button>
            
            <button id="stop-btn" class="action-button hidden">
                Stop Navigation
            </button>
            
            <button id="calibrate-btn" class="action-button">
                📱 Calibrate Compass
            </button>
        </div>
        
        <div id="compass" class="hidden">
            <div id="compass-needle"></div>
            <span>N</span>
        </div>
        
        <div id="map-overlay" class="hidden">
            <div id="map-title">Campus Map</div>
            <div id="campus-map"></div>
        </div>
        
        <div id="debug-panel">
            <div><strong>Debug Information</strong></div>
            <div id="debug-info">Loading...</div>
        </div>
    </div>

     <script src="/ar-navigation.js"></script>

    </div>
  );
}
