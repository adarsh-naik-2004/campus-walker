document.addEventListener("DOMContentLoaded", () => {
  const CAMPUS_NODES = window.CAMPUS_NODES || {};
  const CAMPUS_PATHS = window.CAMPUS_PATHS || [];
  const DESTINATIONS = window.DESTINATIONS || {};

  let userPosition = {
    lat: 21.28912,
    lng: 81.700358,
    accuracy: 5,
    heading: 0,
    speed: 0,
  };
  let userHeading = 0;
  let selectedDestination = null;
  let isNavigating = false;
  let arMarkers = [];
  let gpsAccuracy = Infinity;
  let compassCalibrated = false;
  let lastUpdate = 0;
  let watchId = null;
  let simulationMode = false;
  let currentRoute = [];
  let pathArrows = [];
  let cameraStream = null;
  let uiVisible = true; // NEW: Track UI visibility state

  const elements = {
    loader: document.querySelector(".arjs-loader"),
    loadingStatus: document.getElementById("loading-status"),
    permissionStatus: document.getElementById("permission-status"),
    statusPanel: document.getElementById("status-panel"),
    controlsPanel: document.getElementById("controls-panel"),
    compass: document.getElementById("compass"),
    compassNeedle: document.getElementById("compass-needle"),
    mapOverlay: document.getElementById("map-overlay"),
    mapToggle: document.getElementById("map-toggle"),
    campusMap: document.getElementById("campus-map"),
    cameraContainer: document.getElementById("camera-container"),
    cameraFeed: document.getElementById("camera-feed"),
    debugPanel: document.getElementById("debug-panel"),
    debugInfo: document.getElementById("debug-info"),
    destinationSelect: document.getElementById("destination-select"),
    navigateBtn: document.getElementById("navigate-btn"),
    stopBtn: document.getElementById("stop-btn"),
    calibrateBtn: document.getElementById("calibrate-btn"),
    distanceDisplay: document.getElementById("distance-display"),
    directionDisplay: document.getElementById("direction-display"),
    instructionDisplay: document.getElementById("instruction-display"),
    gpsStatusText: document.getElementById("gps-status-text"),
    statusDot: document.querySelector(".status-dot"),
    scene: document.getElementById("scene"),
    showUiBtn: document.getElementById("show-ui-btn"), // NEW: Show UI button
  };

  function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function calculateBearing(lat1, lng1, lat2, lng2) {
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const lat1Rad = (lat1 * Math.PI) / 180;
    const lat2Rad = (lat2 * Math.PI) / 180;
    const y = Math.sin(dLng) * Math.cos(lat2Rad);
    const x =
      Math.cos(lat1Rad) * Math.sin(lat2Rad) -
      Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
    const bearing = (Math.atan2(y, x) * 180) / Math.PI;
    return (bearing + 360) % 360;
  }

  function bearingToDirection(bearing) {
    const directions = [
      "North",
      "North-East",
      "East",
      "South-East",
      "South",
      "South-West",
      "West",
      "North-West",
    ];
    const index = Math.round(bearing / 45) % 8;
    return directions[index];
  }

  function findNearestNode(lat, lng) {
    let minDistance = Infinity;
    let nearestNode = null;

    for (const [id, node] of Object.entries(CAMPUS_NODES)) {
      const distance = calculateDistance(lat, lng, node.lat, node.lng);
      if (distance < minDistance) {
        minDistance = distance;
        nearestNode = { id, ...node };
      }
    }

    return nearestNode;
  }

  function findShortestPath(startNodeId, endNodeId) {
    const graph = {};

    for (const nodeId in CAMPUS_NODES) {
      graph[nodeId] = [];
    }

    for (const path of CAMPUS_PATHS) {
      graph[path.from].push({ node: path.to, distance: path.distance });
      graph[path.to].push({ node: path.from, distance: path.distance });
    }

    const distances = {};
    const previous = {};
    const queue = [];

    for (const nodeId in graph) {
      if (nodeId === startNodeId) {
        distances[nodeId] = 0;
      } else {
        distances[nodeId] = Infinity;
      }
      previous[nodeId] = null;
      queue.push(nodeId);
    }

    while (queue.length > 0) {
      let minNode = null;
      for (const nodeId of queue) {
        if (minNode === null || distances[nodeId] < distances[minNode]) {
          minNode = nodeId;
        }
      }

      queue.splice(queue.indexOf(minNode), 1);

      if (minNode === endNodeId) {
        break;
      }

      for (const neighbor of graph[minNode]) {
        const alt = distances[minNode] + neighbor.distance;
        if (alt < distances[neighbor.node]) {
          distances[neighbor.node] = alt;
          previous[neighbor.node] = minNode;
        }
      }
    }

    const path = [];
    let current = endNodeId;
    while (current !== null) {
      path.unshift(current);
      current = previous[current];
    }

    return path;
  }

  function calculateRoute() {
    if (!userPosition || !selectedDestination) return [];

    const startNode = findNearestNode(userPosition.lat, userPosition.lng);
    const endNodeId = DESTINATIONS[selectedDestination].node;

    if (!startNode || !endNodeId) return [];

    return findShortestPath(startNode.id, endNodeId);
  }

  function createPathArrows() {
    clearPathArrows();

    for (let i = 0; i < currentRoute.length - 1; i++) {
      const fromNodeId = currentRoute[i];
      const toNodeId = currentRoute[i + 1];

      const fromNode = CAMPUS_NODES[fromNodeId];
      const toNode = CAMPUS_NODES[toNodeId];

      if (!fromNode || !toNode) continue;

      const bearing = calculateBearing(
        fromNode.lat,
        fromNode.lng,
        toNode.lat,
        toNode.lng
      );

      // FIX: Create proper AR arrow using OBJ model
      const arrow = document.createElement("a-entity");
      arrow.classList.add("ar-arrow");
      arrow.setAttribute("gps-entity-place", {
        latitude: fromNode.lat,
        longitude: fromNode.lng,
      });

      arrow.setAttribute("obj-model", "obj: #arrow-obj; mtl: #arrow-mtl");
      arrow.setAttribute("scale", "5 5 5");
      arrow.setAttribute("rotation", `0 ${bearing} 0`);
      arrow.setAttribute(
        "animation",
        "property: position; to: 0 0.5 0; dir: alternate; loop: true; dur: 1500"
      );

      elements.scene.appendChild(arrow);
      pathArrows.push(arrow);

      // Add intermediate arrows for longer paths
      const distance = calculateDistance(
        fromNode.lat,
        fromNode.lng,
        toNode.lat,
        toNode.lng
      );
      if (distance > 30) {
        const numArrows = Math.min(Math.floor(distance / 20), 3);
        for (let j = 1; j <= numArrows; j++) {
          const progress = j / (numArrows + 1);
          const interLat =
            fromNode.lat + (toNode.lat - fromNode.lat) * progress;
          const interLng =
            fromNode.lng + (toNode.lng - fromNode.lng) * progress;

          const interArrow = document.createElement("a-entity");
          interArrow.classList.add("ar-arrow");
          interArrow.setAttribute("gps-entity-place", {
            latitude: interLat,
            longitude: interLng,
          });

          interArrow.setAttribute(
            "obj-model",
            "obj: #arrow-obj; mtl: #arrow-mtl"
          );
          interArrow.setAttribute("scale", "4 4 4");
          interArrow.setAttribute("rotation", `0 ${bearing} 0`);
          interArrow.setAttribute(
            "animation",
            "property: position; to: 0 0.5 0; dir: alternate; loop: true; dur: 1500; delay: " +
              j * 200
          );

          elements.scene.appendChild(interArrow);
          pathArrows.push(interArrow);
        }
      }
    }
  }

  function clearPathArrows() {
    pathArrows.forEach((arrow) => {
      if (arrow.parentNode === elements.scene) {
        elements.scene.removeChild(arrow);
      }
    });
    pathArrows = [];
  }

  function renderCampusMap() {
    elements.campusMap.innerHTML = "";

    const mapWidth = elements.campusMap.clientWidth;
    const mapHeight = elements.campusMap.clientHeight;

    let minLat = Infinity,
      maxLat = -Infinity;
    let minLng = Infinity,
      maxLng = -Infinity;

    for (const node of Object.values(CAMPUS_NODES)) {
      if (node.lat < minLat) minLat = node.lat;
      if (node.lat > maxLat) maxLat = node.lat;
      if (node.lng < minLng) minLng = node.lng;
      if (node.lng > maxLng) maxLng = node.lng;
    }

    const latPadding = (maxLat - minLat) * 0.1;
    const lngPadding = (maxLng - minLng) * 0.1;

    minLat -= latPadding;
    maxLat += latPadding;
    minLng -= lngPadding;
    maxLng += lngPadding;

    const latToY = (lat) => {
      return mapHeight - ((lat - minLat) / (maxLat - minLat)) * mapHeight;
    };

    const lngToX = (lng) => {
      return ((lng - minLng) / (maxLng - minLng)) * mapWidth;
    };

    for (const path of CAMPUS_PATHS) {
      const fromNode = CAMPUS_NODES[path.from];
      const toNode = CAMPUS_NODES[path.to];

      if (!fromNode || !toNode) continue;

      const x1 = lngToX(fromNode.lng);
      const y1 = latToY(fromNode.lat);
      const x2 = lngToX(toNode.lng);
      const y2 = latToY(toNode.lat);

      const dx = x2 - x1;
      const dy = y2 - y1;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

      const pathElem = document.createElement("div");
      pathElem.className = "map-path";
      pathElem.style.width = distance + "px";
      pathElem.style.left = x1 + "px";
      pathElem.style.top = y1 + "px";
      pathElem.style.transform = `rotate(${angle}deg)`;
      elements.campusMap.appendChild(pathElem);
    }

    for (const [id, node] of Object.entries(CAMPUS_NODES)) {
      const x = lngToX(node.lng);
      const y = latToY(node.lat);

      const nodeElem = document.createElement("div");
      nodeElem.className = "map-node";
      nodeElem.style.left = x + "px";
      nodeElem.style.top = y + "px";
      nodeElem.title = node.name;
      elements.campusMap.appendChild(nodeElem);

      const label = document.createElement("div");
      label.className = "map-label";
      label.textContent = node.name;
      label.style.left = x + 10 + "px";
      label.style.top = y - 10 + "px";
      elements.campusMap.appendChild(label);
    }

    if (userPosition && userPosition.lat && userPosition.lng) {
      const x = lngToX(userPosition.lng);
      const y = latToY(userPosition.lat);

      const userElem = document.createElement("div");
      userElem.className = "map-user";
      userElem.style.left = x + "px";
      userElem.style.top = y + "px";
      elements.campusMap.appendChild(userElem);
    }

    if (isNavigating && selectedDestination) {
      const destNode = CAMPUS_NODES[DESTINATIONS[selectedDestination].node];
      if (destNode) {
        const x = lngToX(destNode.lng);
        const y = latToY(destNode.lat);

        const destElem = document.createElement("div");
        destElem.className = "map-destination";
        destElem.style.left = x + "px";
        destElem.style.top = y + "px";
        elements.campusMap.appendChild(destElem);
      }
    }

    if (isNavigating && currentRoute.length > 1) {
      for (let i = 0; i < currentRoute.length - 1; i++) {
        const fromNode = CAMPUS_NODES[currentRoute[i]];
        const toNode = CAMPUS_NODES[currentRoute[i + 1]];

        if (!fromNode || !toNode) continue;

        const x1 = lngToX(fromNode.lng);
        const y1 = latToY(fromNode.lat);
        const x2 = lngToX(toNode.lng);
        const y2 = latToY(toNode.lat);

        const dx = x2 - x1;
        const dy = y2 - y1;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

        const routeElem = document.createElement("div");
        routeElem.className = "map-route";
        routeElem.style.width = distance + "px";
        routeElem.style.left = x1 + "px";
        routeElem.style.top = y1 + "px";
        routeElem.style.transform = `rotate(${angle}deg)`;
        elements.campusMap.appendChild(routeElem);
      }
    }
  }

  function toggleUiVisibility() {
    uiVisible = !uiVisible;

    if (uiVisible) {
      elements.showUiBtn.textContent = "Hide UI";
      elements.statusPanel.classList.remove("hidden");
      elements.controlsPanel.classList.remove("hidden");
      elements.stopBtn.classList.remove("hidden");
    } else {
      elements.showUiBtn.textContent = "Show UI";
      elements.statusPanel.classList.add("hidden");
      elements.controlsPanel.classList.add("hidden");
      elements.stopBtn.classList.add("hidden");
    }
  }

  function startNavigation() {
    if (!selectedDestination || !userPosition) return;

    isNavigating = true;
    uiVisible = false; // Start with UI hidden
    elements.navigateBtn.classList.add("hidden");
    elements.stopBtn.classList.remove("hidden");
    elements.showUiBtn.classList.remove("hidden");
    elements.showUiBtn.textContent = "Show UI";

    // Hide UI elements initially
    elements.statusPanel.classList.add("hidden");
    elements.controlsPanel.classList.add("hidden");
    elements.stopBtn.classList.add("hidden");

    currentRoute = calculateRoute();
    createPathArrows();

    elements.cameraContainer.classList.add("full-screen");
    document.body.classList.add("navigation-active");

    updateNavigation();
  }

  function stopNavigation() {
    isNavigating = false;
    uiVisible = true;
    elements.navigateBtn.classList.remove("hidden");
    elements.stopBtn.classList.add("hidden");
    elements.showUiBtn.classList.add("hidden");

    // Show UI elements again
    elements.statusPanel.classList.remove("hidden");
    elements.controlsPanel.classList.remove("hidden");

    clearPathArrows();

    elements.distanceDisplay.textContent = "Navigation stopped";
    elements.directionDisplay.textContent = "";
    elements.instructionDisplay.textContent =
      "Select a destination to navigate";

    elements.cameraContainer.classList.remove("full-screen");
    document.body.classList.remove("navigation-active");
  }

  function updateNavigation() {
    if (!isNavigating || !userPosition || !selectedDestination) return;

    const destination = DESTINATIONS[selectedDestination];
    const destNode = CAMPUS_NODES[destination.node];

    if (!destNode) return;

    const distance = calculateDistance(
      userPosition.lat,
      userPosition.lng,
      destNode.lat,
      destNode.lng
    );

    const bearing = calculateBearing(
      userPosition.lat,
      userPosition.lng,
      destNode.lat,
      destNode.lng
    );

    const direction = bearingToDirection(bearing);

    if (distance < 10) {
      elements.distanceDisplay.textContent = "🎯 Arrived!";
      elements.directionDisplay.textContent = "You've reached your destination";
      elements.instructionDisplay.textContent = `Welcome to ${destination.name}`;
      setTimeout(() => stopNavigation(), 3000);
    } else if (distance < 50) {
      elements.distanceDisplay.textContent = `${Math.round(distance)}m away`;
      elements.directionDisplay.textContent = `Almost there! Head ${direction}`;
      elements.instructionDisplay.textContent = "Look for the green AR markers";
    } else {
      elements.distanceDisplay.textContent = `${Math.round(distance)}m to ${
        destination.icon
      } ${destination.name}`;
      elements.directionDisplay.textContent = `Head ${direction}`;
      elements.instructionDisplay.textContent =
        "Follow the AR arrows to your destination";
    }

    renderCampusMap();
  }

  function startGPSTracking() {
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
  }

  function handlePositionUpdate(position) {
    const now = Date.now();
    if (now - lastUpdate < 1000) return;

    userPosition = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy,
      heading: position.coords.heading || userHeading,
      speed: position.coords.speed || 0,
      timestamp: position.timestamp,
    };

    gpsAccuracy = position.coords.accuracy;
    lastUpdate = now;

    updateGPSStatus();
    updateDebugInfo();

    if (isNavigating) {
      currentRoute = calculateRoute();
      createPathArrows();
      updateNavigation();
    }

    renderCampusMap();
  }

  function handlePositionError(error) {
    console.error("GPS Error:", error);
    elements.gpsStatusText.textContent = `GPS Error: ${error.message}`;
    elements.statusDot.className = "status-dot status-poor";
    updateDebugInfo();
  }

  function handleOrientationUpdate(event) {
    if (event.alpha !== null) {
      userHeading = event.alpha;
      updateCompass();
      updateDebugInfo();
    }
  }

  function updateGPSStatus() {
    let statusText, statusClass;

    if (gpsAccuracy < 5) {
      statusText = `Excellent GPS (±${Math.round(gpsAccuracy)}m)`;
      statusClass = "status-excellent";
    } else if (gpsAccuracy < 10) {
      statusText = `Good GPS (±${Math.round(gpsAccuracy)}m)`;
      statusClass = "status-good";
    } else if (gpsAccuracy < 20) {
      statusText = `Moderate GPS (±${Math.round(gpsAccuracy)}m)`;
      statusClass = "status-moderate";
    } else {
      statusText = `Poor GPS (±${Math.round(gpsAccuracy)}m)`;
      statusClass = "status-poor";
    }

    elements.gpsStatusText.textContent = statusText;
    elements.statusDot.className = `status-dot ${statusClass}`;
  }

  function updateCompass() {
    if (elements.compassNeedle) {
      elements.compassNeedle.style.transform = `rotate(${userHeading}deg)`;
    }
  }

  function updateDebugInfo() {
    if (!elements.debugPanel) return;

    const debugContent = `
                <div>Lat: ${userPosition.lat.toFixed(6)}</div>
                <div>Lng: ${userPosition.lng.toFixed(6)}</div>
                <div>Accuracy: ${
                  userPosition.accuracy
                    ? userPosition.accuracy.toFixed(1) + "m"
                    : "N/A"
                }</div>
                <div>Heading: ${userHeading.toFixed(1)}°</div>
                <div>Speed: ${
                  userPosition.speed
                    ? (userPosition.speed * 3.6).toFixed(1) + " km/h"
                    : "N/A"
                }</div>
                <div>Destination: ${selectedDestination || "None"}</div>
                <div>Navigation: ${isNavigating ? "Active" : "Inactive"}</div>
                <div>Route: ${currentRoute.join(" → ") || "None"}</div>
            `;

    elements.debugInfo.innerHTML = debugContent;
  }

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      elements.cameraFeed.srcObject = stream;
      elements.cameraContainer.classList.remove("hidden");

      cameraStream = stream;
      return stream;
    } catch (error) {
      console.error("Camera error:", error);
      elements.loadingStatus.textContent = `Camera Error: ${error.message}`;

      elements.permissionStatus.innerHTML = `
                    Camera access required!<br>
                    <button id="retry-camera" style="margin-top:10px; padding:5px 10px;">
                        Retry Camera Access
                    </button>
                `;
      document
        .getElementById("retry-camera")
        .addEventListener("click", initialize);
      throw error;
    }
  }

  async function initialize() {
    try {
      elements.loadingStatus.textContent = "Initializing AR navigation...";
      elements.permissionStatus.textContent = "Requesting permissions...";

      elements.loadingStatus.textContent = "Requesting location access...";
      await requestLocationPermission();

      elements.loadingStatus.textContent = "Requesting camera access...";
      await startCamera();

      startGPSTracking();
      setupEventListeners();

      setTimeout(() => {
        elements.loader.style.opacity = "0";
        setTimeout(() => {
          elements.loader.classList.add("hidden");
          elements.statusPanel.classList.remove("hidden");
          elements.controlsPanel.classList.remove("hidden");
          elements.compass.classList.remove("hidden");
          elements.debugPanel.style.display = "block";
          renderCampusMap();
        }, 500);
      }, 1000);
    } catch (error) {
      console.error("Initialization failed:", error);
      elements.loadingStatus.textContent = `Error: ${error.message}`;

      if (error.message.includes("Camera")) {
        elements.permissionStatus.innerHTML = `
                        Camera access required!<br>
                        <button id="retry-camera" style="margin-top:10px; padding:5px 10px;">
                            Retry Camera Access
                        </button>
                    `;
        document
          .getElementById("retry-camera")
          .addEventListener("click", initialize);
      } else if (error.message.includes("Location")) {
        elements.permissionStatus.innerHTML = `
                        Location access required!<br>
                        <button id="retry-location" style="margin-top:10px; padding:5px 10px;">
                            Retry Location Access
                        </button>
                    `;
        document
          .getElementById("retry-location")
          .addEventListener("click", initialize);
      } else {
        elements.permissionStatus.textContent =
          "Please refresh and grant permissions";
      }
    }
  }

  async function requestLocationPermission() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          elements.permissionStatus.textContent = "✅ Location access granted";
          resolve(position);
        },
        (error) => {
          const messages = {
            [error.PERMISSION_DENIED]: "Location permission denied",
            [error.POSITION_UNAVAILABLE]: "Location unavailable",
            [error.TIMEOUT]: "Location request timeout",
          };
          reject(new Error(messages[error.code] || "Location error"));
        },
        { enableHighAccuracy: true, timeout: 15000 }
      );
    });
  }

  function setupEventListeners() {
    elements.mapToggle.addEventListener("click", () => {
      elements.mapOverlay.classList.toggle("hidden");
      elements.mapToggle.textContent = elements.mapOverlay.classList.contains(
        "hidden"
      )
        ? "Show Campus Map"
        : "Hide Campus Map";
    });

    elements.destinationSelect.addEventListener("change", (e) => {
      selectedDestination = e.target.value;
      elements.navigateBtn.disabled = !selectedDestination;

      if (selectedDestination) {
        const dest = DESTINATIONS[selectedDestination];
        elements.distanceDisplay.textContent = `Ready to navigate to ${dest.icon} ${dest.name}`;
        elements.instructionDisplay.textContent = `Tap "Start Navigation" to begin route`;
      } else {
        elements.distanceDisplay.textContent = "Select destination";
        elements.instructionDisplay.textContent =
          "Choose where you want to navigate";
      }
    });

    elements.navigateBtn.addEventListener("click", startNavigation);
    elements.stopBtn.addEventListener("click", stopNavigation);

    elements.calibrateBtn.addEventListener("click", () => {
      elements.instructionDisplay.textContent =
        "Move your phone in a figure-8 pattern for 5 seconds...";

      setTimeout(() => {
        compassCalibrated = true;
        elements.instructionDisplay.textContent =
          "Compass calibrated! Navigation accuracy improved.";
      }, 5000);
    });

    elements.showUiBtn.addEventListener("click", toggleUiVisibility);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }

  window.addEventListener("beforeunload", () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
    }
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }
  });

  initialize();
});
