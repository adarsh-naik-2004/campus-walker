import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddLocation from "./AddLocation.jsx";
import AddPath from "./AddPath.jsx";
import IndoorManagement from "./IndoorManagement.jsx";
import api from "../../utils/api.js";

export default function InstituteAdminDashboard() {
  const [activeTab, setActiveTab] = useState("visitors");
  const [locations, setLocations] = useState([]);
  const [paths, setPaths] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [institute, setInstitute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const instituteId = localStorage.getItem("institute");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("institute");
    navigate("/admin");
  };

  useEffect(() => {
    if (!instituteId) {
      navigate("/admin");
      return;
    }

    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        // Fetch institute details
        const { data: instituteData } = await api.get(
          `/institute/${instituteId}`,
          { headers: { "x-auth-token": token } }
        );

        // Fetch locations
        const { data: locationsData } = await api.get(
          `/institute/${instituteId}/locations`,
          { headers: { "x-auth-token": token } }
        );

        // Fetch visitors
        const { data: visitorsData } = await api.get(
          `/visitors/institute/${instituteId}`,
          { headers: { "x-auth-token": token } }
        );

        const { data: pathsData } = await api.get(
          `/institute/${instituteId}/paths`,
          { headers: { "x-auth-token": token } }
        );
        setPaths(pathsData);

        // Fetch paths

        setInstitute(instituteData);
        setLocations(locationsData);
        setVisitors(visitorsData);

        setError("");
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load dashboard data. Please try again.");
        if (error.response?.status === 401) handleLogout();
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [instituteId, navigate]);

  const handleDeleteLocation = async (locationId) => {
    try {
      await api.delete(`/institute/locations/${locationId}`, {
        headers: { "x-auth-token": localStorage.getItem("token") },
      });
      setLocations(locations.filter((l) => l._id !== locationId));
    } catch (error) {
      console.error("Error deleting location:", error);
      setError("Failed to delete location. Please try again.");
    }
  };

  const handleDeleteVisitor = async (visitorId) => {
    try {
      await api.delete(`/visitors/${visitorId}`, {
        headers: { "x-auth-token": localStorage.getItem("token") },
      });
      setVisitors(visitors.filter((v) => v._id !== visitorId));
    } catch (error) {
      console.error("Error deleting visitor:", error);
      setError("Failed to delete visitor. Please try again.");
    }
  };

  const handleDeletePath = async (pathId) => {
    try {
      await api.delete(`/institute/paths/${pathId}`, {
        headers: { "x-auth-token": localStorage.getItem("token") },
      });
      setPaths(paths.filter((p) => p._id !== pathId));
    } catch (error) {
      console.error("Error deleting path:", error);
      setError("Failed to delete path. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "visitors", label: "Visitors", icon: "👥", count: visitors.length },
    {
      id: "locations",
      label: "Locations",
      icon: "📍",
      count: locations.length,
    },
    { id: "routes", label: "Routes", icon: "🛣️", count: paths.length },
    { id: "indoor", label: "Indoor Nav", icon: "🏢" }, // New routes tab
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header Section - College/Institute Info */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            {/* Left: Institute Info */}
            <div className="flex items-center space-x-4">
              {/* University Logo */}
              <div className="flex-shrink-0">
                {institute?.university?.logo ? (
                  <img
                    src={institute.university.logo}
                    alt="University Logo"
                    className="h-16 w-16 object-contain rounded-xl border-2 border-gray-100 shadow-sm"
                  />
                ) : (
                  <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                    <span className="text-white text-2xl font-bold">
                      {institute?.name?.charAt(0) || "I"}
                    </span>
                  </div>
                )}
              </div>

              {/* Institute Details */}
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold text-gray-900 truncate">
                  {institute?.name || "Institute Dashboard"}
                </h1>
                <p className="text-lg font-medium text-gray-700 truncate">
                  {institute?.university?.name || "University"}
                </p>
                {institute?.university?.address && (
                  <p className="text-sm text-gray-500 truncate">
                    📍 {institute.university.address}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200
                  ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
                <span
                  className={`
                    inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full
                    ${
                      activeTab === tab.id
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-600"
                    }
                  `}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center space-x-3">
            <span className="text-xl">⚠️</span>
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Tab Content */}
        <div className="tab-content">
          {/* Visitors Tab */}
          {activeTab === "visitors" && (
            <div className="bg-white rounded-2xl shadow-lg">
              {/* Tab Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">👥</span>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Institute Visitors
                      </h2>
                      <p className="text-sm text-gray-600">
                        Manage visitor records and information
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Total:{" "}
                    <span className="font-bold text-gray-900">
                      {visitors.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Visitors Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {[
                        "Name",
                        "Contact",
                        "Purpose",
                        "Visit Date",
                        "Actions",
                      ].map((header) => (
                        <th
                          key={header}
                          className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {visitors.map((visitor) => (
                      <tr
                        key={visitor._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {visitor.name}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-600">{visitor.email}</div>
                          <div className="text-sm text-gray-500">
                            {visitor.mobile}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {visitor.purpose}
                        </td>
                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                          {new Date(visitor.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            className="text-red-500 hover:text-red-700 font-medium transition-colors"
                            onClick={() => {
                              if (
                                window.confirm("Delete this visitor record?")
                              ) {
                                handleDeleteVisitor(visitor._id);
                              }
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {visitors.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center">
                          <div className="text-gray-400 text-6xl mb-4">👥</div>
                          <p className="text-gray-500 font-medium">
                            No visitors found
                          </p>
                          <p className="text-sm text-gray-400">
                            Visitor records will appear here
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Locations Tab */}
          {activeTab === "locations" && (
            <div className="space-y-8">
              {/* Add Location Form */}
              <AddLocation
                instituteId={instituteId}
                setLocations={setLocations}
              />

              {/* Locations List */}
              <div className="bg-white rounded-2xl shadow-lg">
                {/* Tab Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">📍</span>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          Institute Locations
                        </h2>
                        <p className="text-sm text-gray-600">
                          Manage all campus locations and facilities
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      Total:{" "}
                      <span className="font-bold text-gray-900">
                        {locations.length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Locations Grid */}
                <div className="p-6">
                  {locations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {locations.map((location) => (
                        <div
                          key={location._id}
                          className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100 hover:border-gray-200"
                        >
                          {/* Location Image */}
                          {location.image ? (
                            <div className="mb-4 h-48 rounded-lg overflow-hidden">
                              <img
                                src={location.image}
                                alt={location.name}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                              />
                            </div>
                          ) : (
                            <div className="mb-4 h-48 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                              <span className="text-gray-400 text-4xl">🏢</span>
                            </div>
                          )}

                          {/* Location Info */}
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <h3 className="text-lg font-semibold text-gray-900 truncate">
                                {location.name}
                              </h3>
                              <button
                                onClick={() => {
                                  if (window.confirm("Delete this location?")) {
                                    handleDeleteLocation(location._id);
                                  }
                                }}
                                className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                              >
                                Delete
                              </button>
                            </div>

                            <div className="space-y-2 text-sm">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-500">Floor:</span>
                                <span className="font-medium bg-gray-100 px-2 py-1 rounded">
                                  {location.floor}
                                </span>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-gray-500">
                                  Coordinates:
                                </span>
                                <span className="font-mono text-xs">
                                  ({location.coordinates.latitude.toFixed(2)},{" "}
                                  {location.coordinates.longitude.toFixed(2)})
                                </span>
                              </div>

                              {location.description && (
                                <div className="pt-2 border-t border-gray-100">
                                  <p className="text-gray-600 text-sm line-clamp-2">
                                    {location.description}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-6xl mb-4">📍</div>
                      <p className="text-gray-500 font-medium">
                        No locations found
                      </p>
                      <p className="text-sm text-gray-400">
                        Add your first location above
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "routes" && (
            <div className="space-y-8">
              {/* Add Path Form */}
              <AddPath
                instituteId={instituteId}
                locations={locations}
                setPaths={setPaths}
              />

              {/* Paths List */}
              <div className="bg-white rounded-2xl shadow-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🛣️</span>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          Navigation Routes
                        </h2>
                        <p className="text-sm text-gray-600">
                          Manage paths between campus locations
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      Total:{" "}
                      <span className="font-bold text-gray-900">
                        {paths.length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {paths.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              From
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              To
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              Distance
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              Time
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              Accessibility
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {paths.map((path) => (
                            <tr key={path._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-gray-900 font-medium">
                                {path.fromName}
                              </td>
                              <td className="px-6 py-4 text-gray-900 font-medium">
                                {path.toName}
                              </td>
                              <td className="px-6 py-4 text-gray-600">
                                {path.distance
                                  ? `${path.distance.toFixed(2)} meters`
                                  : "N/A"}
                              </td>
                              <td className="px-6 py-4 text-gray-600">
                                {path.estimatedTime
                                  ? `${path.estimatedTime} mins`
                                  : "N/A"}
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    path.accessibilityFriendly
                                      ? "bg-green-100 text-green-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {path.accessibilityFriendly ? "Yes" : "No"}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <button
                                  className="text-red-500 hover:text-red-700 font-medium transition-colors"
                                  onClick={() => {
                                    if (window.confirm("Delete this route?")) {
                                      handleDeletePath(path._id);
                                    }
                                  }}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-6xl mb-4">🛣️</div>
                      <p className="text-gray-500 font-medium">
                        No routes created yet
                      </p>
                      <p className="text-sm text-gray-400">
                        Add your first route above
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "indoor" && (
            <IndoorManagement instituteId={instituteId} />
          )}
        </div>
      </div>
    </div>
  );
}
