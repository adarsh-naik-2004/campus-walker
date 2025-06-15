import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateInstitute from "./CreateInstitute.jsx";
import ViewLocations from "./ViewLocations.jsx";
import api from "../../utils/api.js";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function UniversityAdminDashboard() {
  const [activeTab, setActiveTab] = useState("institutes");
  const [institutes, setInstitutes] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [university, setUniversity] = useState(null);
  const [selectedInstitute, setSelectedInstitute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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

  // Prepare chart data for visitors
  const prepareVisitorCharts = () => {
    // Visitors by date
    const visitorsByDate = visitors.reduce((acc, visitor) => {
      const date = new Date(visitor.createdAt).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Visitors by institute
    const visitorsByInstitute = visitors.reduce((acc, visitor) => {
      const instituteName = visitor.institute?.name || "Unknown Institute";
      acc[instituteName] = (acc[instituteName] || 0) + 1;
      return acc;
    }, {});

    return {
      dateData: {
        labels: Object.keys(visitorsByDate),
        datasets: [
          {
            label: "Visitors per Day",
            data: Object.values(visitorsByDate),
            backgroundColor: "rgba(59, 130, 246, 0.6)",
            borderColor: "rgba(59, 130, 246, 1)",
            borderWidth: 1,
          },
        ],
      },
      instituteData: {
        labels: Object.keys(visitorsByInstitute),
        datasets: [
          {
            data: Object.values(visitorsByInstitute),
            backgroundColor: [
              "rgba(255, 99, 132, 0.6)",
              "rgba(54, 162, 235, 0.6)",
              "rgba(255, 206, 86, 0.6)",
              "rgba(75, 192, 192, 0.6)",
              "rgba(153, 102, 255, 0.6)",
              "rgba(255, 159, 64, 0.6)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(153, 102, 255, 1)",
              "rgba(255, 159, 64, 1)",
            ],
            borderWidth: 1,
          },
        ],
      },
    };
  };

  const visitorCharts = visitors.length > 0 ? prepareVisitorCharts() : null;

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
    { id: "institutes", label: "Institutes", icon: "🏢", count: institutes.length },
    { id: "locations", label: "Locations", icon: "📍" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: University Info */}
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {university?.logo ? (
                  <img
                    src={university.logo}
                    alt="University Logo"
                    className="h-12 w-12 md:h-16 md:w-16 object-contain rounded-xl border-2 border-gray-100 shadow-sm"
                  />
                ) : (
                  <div className="h-12 w-12 md:h-16 md:w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                    <span className="text-white text-xl md:text-2xl font-bold">🏛️</span>
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">
                  {university?.name || "University"} Dashboard
                </h1>
                <p className="text-sm md:text-base text-gray-600 truncate">
                  {university?.address}
                </p>
              </div>
            </div>

            {/* Right: Mobile Menu and Logout */}
            <div className="flex items-center space-x-3">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center space-x-2 px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm md:text-base"
              >
                <span>🚪</span>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex flex-col space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setShowMobileMenu(false);
                  }}
                  className={`flex items-center space-x-2 py-2 px-3 rounded-lg text-left ${
                    activeTab === tab.id
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`ml-auto inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full ${
                        activeTab === tab.id
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 py-2 px-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-medium"
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation (Desktop) */}
      <div className="bg-white border-b border-gray-200 hidden md:block">
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
                {tab.count !== undefined && (
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
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
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
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">👥</span>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        University Visitors
                      </h2>
                      <p className="text-sm text-gray-600">
                        Visitor records across all institutes
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

              {/* Visitor Charts */}
              {visitors.length > 0 && visitorCharts && (
                <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Visitors by Date
                    </h3>
                    <div className="h-64">
                      <Bar
                        data={visitorCharts.dateData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: "top",
                            },
                            title: {
                              display: true,
                              text: "Visitors per Day",
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Visitors by Institute
                    </h3>
                    <div className="h-64">
                      <Pie
                        data={visitorCharts.instituteData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: "right",
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Visitors Table */}
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

          {/* Institutes Tab */}
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

          {/* Locations Tab */}
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