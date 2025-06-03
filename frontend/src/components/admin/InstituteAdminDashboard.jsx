import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddLocation from "./AddLocation.jsx";
import api from "../../utils/api.js";

export default function InstituteAdminDashboard() {
  const [activeTab, setActiveTab] = useState("visitors");
  const [locations, setLocations] = useState([]);
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

        // Fetch institute details with university info
        const { data: instituteData } = await api.get(
          `/institute/${instituteId}`, // Matches backend route
          { headers: { "x-auth-token": token } }
        );

        // Fetch institute-specific locations
        const { data: locationsData } = await api.get(
          `/institute/${instituteId}/locations`,
          { headers: { "x-auth-token": token } }
        );

        // Fetch institute-specific visitors
        const { data: visitorsData } = await api.get(
          `/visitors/institute/${instituteId}`,
          { headers: { "x-auth-token": token } }
        );

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
        headers: {
          "x-auth-token": localStorage.getItem("token"),
        },
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
        headers: {
          "x-auth-token": localStorage.getItem("token"),
        },
      });
      setVisitors(visitors.filter((v) => v._id !== visitorId));
    } catch (error) {
      console.error("Error deleting visitor:", error);
      setError("Failed to delete visitor. Please try again.");
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600 text-center">{error}</div>;
  }

  return (
  <div className="min-h-screen bg-gray-50 p-6">
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 bg-white p-4 rounded-2xl shadow-lg">
        <div className="flex items-center gap-4">
          {institute?.university?.logo && (
            <img
              src={institute.university.logo}
              alt="University Logo"
              className="h-16 w-16 object-contain rounded-lg border-2 border-gray-100"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-2xl">🏢</span>
              {institute?.name || "Institute"} Dashboard
            </h1>
            <p className="text-lg text-gray-700 font-medium mt-1">
              {institute?.university?.name || "University"}
            </p>
            <p className="text-sm text-gray-500">
              {institute?.university?.address}
            </p>
        </div>
        <button
          onClick={handleLogout}
          className="px-6 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg font-semibold hover:from-red-700 hover:to-rose-700 transition-all transform hover:scale-[1.02] shadow-md"
        >
          Logout
        </button>
      </div>

      {/* Navigation Menu */}
      <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-xl shadow-sm">
        {[
          { id: "visitors", label: "Visitors", icon: "👥" },
          { id: "locations", label: "Locations", icon: "📍" },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
              activeTab === tab.id
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Visitors Tab */}
      {activeTab === "visitors" && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            👥 Institute Visitors
          </h2>
          <div className="overflow-x-auto rounded-lg border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {["Name", "Contact", "Purpose", "Visit Date", "Actions"].map(
                    (header) => (
                      <th
                        key={header}
                        className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {visitors.map((visitor) => (
                  <tr key={visitor._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{visitor.name}</td>
                    <td className="px-6 py-4">
                      <div className="text-gray-600">{visitor.email}</div>
                      <div className="text-gray-500">{visitor.mobile}</div>
                    </td>
                    <td className="px-6 py-4">{visitor.purpose}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(visitor.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => {
                          if (window.confirm("Delete this visitor record?")) {
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
                    <td
                      colSpan="5"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No visitors found for this institute
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
          {/* Add Location Component */}
          <AddLocation instituteId={instituteId} setLocations={setLocations} />

          {/* Locations List */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              📍 Institute Locations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {locations.map((location) => (
                <div
                  key={location._id}
                  className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100"
                > 
                  {location.image && (
                    <div className="mb-4 h-48 rounded-lg overflow-hidden">
                      <img 
                        src={location.image} 
                        alt={location.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {location.name}
                    </h3>
                    <button
                      onClick={() => {
                        if (window.confirm("Delete this location?")) {
                          handleDeleteLocation(location._id);
                        }
                      }}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p className="flex items-center gap-1">
                      <span className="text-gray-500">Floor:</span>
                      <span className="font-medium">{location.floor}</span>
                    </p>
                    
                    <p className="flex items-center gap-1">
                      <span className="text-gray-500">Coordinates:</span>
                      <span className="font-mono">
                        ({location.coordinates.latitude.toFixed(2)},{" "}
                        {location.coordinates.longitude.toFixed(2)})
                      </span>
                    </p>
                    {location.description && (
                      <p className="text-gray-600 text-sm">
                        {location.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {locations.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500 text-lg">
                    No locations found. Add your first location above.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
  </div>
  </div>
  </div>
  );
}
