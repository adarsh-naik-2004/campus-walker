import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateInstitute from "./CreateInstitute.jsx";
import ViewLocations from "./ViewLocations.jsx";
import api from "../../utils/api.js";

export default function UniversityAdminDashboard() {
  const [activeTab, setActiveTab] = useState("institutes");
  const [institutes, setInstitutes] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [university, setUniversity] = useState(null);
  const [selectedInstitute, setSelectedInstitute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const universityId = localStorage.getItem("university");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("university");
    navigate("/admin");
  };

  useEffect(() => {
    if (!universityId) {
      navigate("/admin");
      return;
    }

    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const { data: universityData } = await api.get(
          `/university/${universityId}`,
          { headers: { "x-auth-token": token } }
        );

        const { data: institutesData } = await api.get(
          `/university/${universityId}/institutes`,
          { headers: { "x-auth-token": token } }
        );

        const { data: visitorsData } = await api.get(
          `/visitors/university/${universityId}`,
          { headers: { "x-auth-token": token } }
        );

        setUniversity(universityData);
        setInstitutes(institutesData);
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
  }, [universityId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-red-600 bg-white p-8 rounded-2xl shadow-lg">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-lg">{error}</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "visitors", label: "Visitors", icon: "👥", count: visitors.length },
    { id: "institutes", label: "Institutes", icon: "🏢", count: institutes.length },
    { id: "locations", label: "Locations", icon: "📍" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* University Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {university?.logo && (
                <div className="flex-shrink-0">
                  <img
                    src={university.logo}
                    alt="University Logo"
                    className="h-20 w-20 object-contain rounded-xl border-2 border-gray-100 shadow-sm"
                  />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  {university?.name || "University Dashboard"}
                </h1>
                <p className="text-gray-600 text-lg">{university?.address}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    🟢 Online
                  </span>
                  <span className="text-sm text-gray-500">
                    Admin Dashboard
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
            >
              <span>🚪</span>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-0">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                className={`relative px-8 py-4 font-semibold text-lg transition-all duration-200 border-b-3 flex items-center gap-3 ${
                  activeTab === tab.id
                    ? "text-blue-600 border-blue-600 bg-blue-50/50"
                    : "text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="text-2xl">{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`ml-2 px-2.5 py-1 rounded-full text-sm font-bold ${
                    activeTab === tab.id 
                      ? "bg-blue-600 text-white" 
                      : "bg-gray-200 text-gray-700"
                  }`}>
                    {tab.count}
                  </span>
                )}
                {/* Active tab indicator */}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === "visitors" && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    👥 University Visitors
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Track and manage all university visitors
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">{visitors.length}</div>
                  <div className="text-sm text-gray-500">Total Visitors</div>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {["Name", "Contact", "Institute", "Purpose", "Visit Date"].map(
                      (header) => (
                        <th
                          key={header}
                          className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {visitors.map((visitor) => (
                    <tr key={visitor._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="font-semibold text-gray-900">{visitor.name}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-gray-700">{visitor.email}</div>
                        <div className="text-gray-500 text-sm">{visitor.mobile}</div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {visitor.institute?.name || "N/A"}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-gray-700">{visitor.purpose}</td>
                      <td className="px-8 py-6 text-gray-700">
                        {new Date(visitor.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                  {visitors.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-8 py-12 text-center text-gray-500">
                        <div className="text-6xl mb-4">👥</div>
                        <p className="text-lg">No visitors found for this university</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "institutes" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <CreateInstitute
                universityId={universityId}
                setInstitutes={setInstitutes}
              />
              
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-8 py-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        🏢 University Institutes
                      </h2>
                      <p className="text-gray-600 mt-1">
                        Manage all institutes under this university
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-600">{institutes.length}</div>
                      <div className="text-sm text-gray-500">Total Institutes</div>
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Institute Name
                        </th>
                        <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Created Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {institutes.map((institute) => (
                        <tr key={institute._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-8 py-6">
                            <div className="font-semibold text-gray-900">{institute.name}</div>
                          </td>
                          <td className="px-8 py-6 text-gray-700">
                            {new Date(institute.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                      {institutes.length === 0 && (
                        <tr>
                          <td colSpan="2" className="px-8 py-12 text-center text-gray-500">
                            <div className="text-6xl mb-4">🏢</div>
                            <p className="text-lg">No institutes found. Create one to get started.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "locations" && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-8 py-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                📍 Location Management
              </h2>
              <p className="text-gray-600 mt-1">
                View and manage locations across all institutes
              </p>
            </div>
            
            <div className="p-8">
              <ViewLocations
                institutes={institutes}
                selectedInstitute={selectedInstitute}
                setSelectedInstitute={setSelectedInstitute}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}