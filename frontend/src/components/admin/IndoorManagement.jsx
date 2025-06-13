import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import api from "../../utils/api";
import QRCode from "qrcode.react";

export default function IndoorManagement({ instituteId }) {
  const [activeTab, setActiveTab] = useState("locations");
  const [locations, setLocations] = useState([]);
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [currentQRNode, setCurrentQRNode] = useState(null);
  const qrRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    nodeId: "",
    building: "",
    floor: 1,
    x: 0,
    y: 0,
    category: "room",
  });

  const [pathData, setPathData] = useState({
    from: "",
    to: "",
    distance: 10,
    isStair: false,
    isElevator: false,
    floorChange: 0,
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "locations") {
        const { data } = await api.get(`/indoor/locations/${instituteId}`);
        setLocations(data);
      } else {
        const { data: locs } = await api.get(
          `/indoor/locations/${instituteId}`
        );
        setLocations(locs);

        // Use the new endpoint for fetching paths
        const { data: pathsData } = await api.get("/indoor/paths");
        setPaths(pathsData);
      }
    } catch (err) {
      toast.error("Failed to load data");
    }
    setLoading(false);
  };

  const handleAddLocation = async () => {
    try {
      const { data } = await api.post("/indoor/locations", {
        ...formData,
        instituteId,
      });
      setLocations([...locations, data]);
      setFormData({
        name: "",
        nodeId: "",
        building: "",
        floor: 1,
        x: 0,
        y: 0,
        category: "room",
      });
      toast.success("Location added!");
    } catch (err) {
      toast.error("Failed to add location");
    }
  };

  const handleAddPath = async () => {
    try {
      const { data } = await api.post("/indoor/paths", {
        ...pathData,
        instituteId,
      });
      setPaths([...paths, data]);
      setPathData({
        from: "",
        to: "",
        distance: 10,
        isStair: false,
        isElevator: false,
        floorChange: 0,
      });
      toast.success("Path added!");
    } catch (err) {
      toast.error("Failed to add path");
    }
  };

  const handleDeleteLocation = async (id) => {
    if (window.confirm("Delete this location?")) {
      try {
        await api.delete(`/indoor/locations/${id}`);
        setLocations(locations.filter((l) => l._id !== id));
        toast.success("Location deleted");
      } catch (err) {
        toast.error("Failed to delete");
      }
    }
  };

  const handleDeletePath = async (id) => {
    if (window.confirm("Delete this path?")) {
      try {
        await api.delete(`/indoor/paths/${id}`);
        setPaths(paths.filter((p) => p._id !== id));
        toast.success("Path deleted");
      } catch (err) {
        toast.error("Failed to delete");
      }
    }
  };

  const downloadQRCode = () => {
    if (!qrRef.current) return;

    const canvas = qrRef.current.querySelector("canvas");
    if (!canvas) return;

    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = `qr-${currentQRNode.nodeId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateQRForLocation = (location) => {
    setCurrentQRNode(location);
    setShowQRModal(true);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
      {showQRModal && currentQRNode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-bold mb-4">
              QR Code for {currentQRNode.name}
            </h3>
            <div ref={qrRef} className="flex justify-center mb-4">
              <QRCode
                value={`${currentQRNode.building}-${currentQRNode.nodeId}`}
                size={256}
                level="H"
                includeMargin={true}
                fgColor="#1e40af"
              />
            </div>
            <p className="text-center mb-2 text-sm text-gray-600">
              Node ID: {currentQRNode.nodeId}
            </p>
            <div className="flex justify-center space-x-3">
              <button
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                onClick={() => setShowQRModal(false)}
              >
                Close
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={downloadQRCode}
              >
                Download QR
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "locations"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("locations")}
        >
          Indoor Locations
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "paths"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("paths")}
        >
          Navigation Paths
        </button>
      </div>

      {activeTab === "locations" ? (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Node ID</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={formData.nodeId}
                onChange={(e) =>
                  setFormData({ ...formData, nodeId: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Building</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={formData.building}
                onChange={(e) =>
                  setFormData({ ...formData, building: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Floor</label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={formData.floor}
                onChange={(e) =>
                  setFormData({ ...formData, floor: parseInt(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                X Position
              </label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={formData.x}
                onChange={(e) =>
                  setFormData({ ...formData, x: parseInt(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Y Position
              </label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={formData.y}
                onChange={(e) =>
                  setFormData({ ...formData, y: parseInt(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                className="w-full p-2 border rounded"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              >
                <option value="room">Room</option>
                <option value="stair">Staircase</option>
                <option value="elevator">Elevator</option>
                <option value="entrance">Entrance</option>
              </select>
            </div>
          </div>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={handleAddLocation}
          >
            Add Location
          </button>

          <div className="mt-8">
            <h3 className="text-lg font-bold mb-4">Existing Locations</h3>
            {locations.length === 0 ? (
              <p className="text-gray-500">No locations added yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {locations.map((loc) => (
                  <div key={loc._id} className="border rounded-lg p-4">
                    <div className="flex justify-between">
                      <h4 className="font-bold">
                        {loc.name}{" "}
                        <span className="text-blue-600">({loc.nodeId})</span>
                      </h4>
                      <p className="text-sm">
                        {loc.building}, Floor {loc.floor}
                      </p>
                      <p className="text-xs text-gray-500">
                        Position: ({loc.x}, {loc.y}) | Type: {loc.category}
                      </p>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteLocation(loc._id)}
                      >
                        Delete
                      </button>
                      <button
                        className="text-blue-500 hover:text-blue-700 text-sm"
                        onClick={() => generateQRForLocation(loc)}
                      >
                        Generate QR
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                From Location
              </label>
              <select
                className="w-full p-2 border rounded"
                value={pathData.from}
                onChange={(e) =>
                  setPathData({ ...pathData, from: e.target.value })
                }
              >
                <option value="">Select start point</option>
                {locations.map((loc) => (
                  <option key={loc._id} value={loc._id}>
                    {loc.name} ({loc.building}-{loc.floor})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                To Location
              </label>
              <select
                className="w-full p-2 border rounded"
                value={pathData.to}
                onChange={(e) =>
                  setPathData({ ...pathData, to: e.target.value })
                }
              >
                <option value="">Select end point</option>
                {locations.map((loc) => (
                  <option value={loc.nodeId}>
                    {loc.name} ({loc.building}-{loc.floor})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Distance (meters)
              </label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={pathData.distance}
                onChange={(e) =>
                  setPathData({
                    ...pathData,
                    distance: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Floor Change
              </label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={pathData.floorChange}
                onChange={(e) =>
                  setPathData({
                    ...pathData,
                    floorChange: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isStair"
                checked={pathData.isStair}
                onChange={(e) =>
                  setPathData({ ...pathData, isStair: e.target.checked })
                }
                className="mr-2"
              />
              <label htmlFor="isStair">Staircase Path</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isElevator"
                checked={pathData.isElevator}
                onChange={(e) =>
                  setPathData({ ...pathData, isElevator: e.target.checked })
                }
                className="mr-2"
              />
              <label htmlFor="isElevator">Elevator Path</label>
            </div>
          </div>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={handleAddPath}
          >
            Add Path
          </button>

          <div className="mt-8">
            <h3 className="text-lg font-bold mb-4">Existing Paths</h3>
            {paths.length === 0 ? (
              <p className="text-gray-500">No paths added yet</p>
            ) : (
              <div className="space-y-4">
                {paths.map((path) => (
                  <div key={path._id} className="border rounded-lg p-4">
                    <div className="flex justify-between">
                      <div>
                        <p>
                          <strong>From:</strong> {path.from?.name || "Unknown"}
                        </p>
                        <p>
                          <strong>To:</strong> {path.to?.name || "Unknown"}
                        </p>
                      </div>
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeletePath(path._id)}
                      >
                        Delete
                      </button>
                    </div>
                    <p>
                      Distance: {path.distance}m | Floor Change:{" "}
                      {path.floorChange}
                    </p>
                    <p>
                      Stair: {path.isStair ? "Yes" : "No"} | Elevator:{" "}
                      {path.isElevator ? "Yes" : "No"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
