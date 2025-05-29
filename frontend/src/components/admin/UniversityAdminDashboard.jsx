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
          {university?.logo && (
            <img
              src={university.logo}
              alt="University Logo"
              className="h-16 w-16 object-contain rounded-lg border-2 border-gray-100"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-2xl">🏛️</span>
              {university?.name || "University"} Dashboard
            </h1>
            <p className="text-gray-600 mt-1">{university?.address}</p>
          </div>
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
          { id: "institutes", label: "Institutes", icon: "🏢" },
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

      {/* Content Sections */}
      <div className="space-y-12">
        {activeTab === "visitors" && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              👥 University Visitors
            </h2>
            <div className="overflow-x-auto rounded-lg border border-gray-100">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {["Name", "Contact", "Institute", "Purpose", "Visit Date"].map(
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
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {visitor.institute?.name || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">{visitor.purpose}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
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
                      <td
                        colSpan="5"
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No visitors found for this university
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "institutes" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <CreateInstitute
              universityId={universityId}
              setInstitutes={setInstitutes}
            />
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                🏢 University Institutes
              </h2>
              <div className="overflow-x-auto rounded-lg border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Institute Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Created Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {institutes.map((institute) => (
                      <tr key={institute._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">
                          {institute.name}
                        </td>
                        <td className="px-6 py-4">
                          {new Date(institute.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {institutes.length === 0 && (
                      <tr>
                        <td
                          colSpan="2"
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          No institutes found. Create one to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "locations" && (
          <ViewLocations
            institutes={institutes}
            selectedInstitute={selectedInstitute}
            setSelectedInstitute={setSelectedInstitute}
          />
        )}
      </div>
    </div>
  </div>
);
}
