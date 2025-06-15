import { useEffect, useState } from "react";
import CreateUniversity from "./CreateUniversity.jsx";
import CreateUniversityAdmin from "./CreateUniversityAdmin.jsx";
import CreateInstitute from "./CreateInstitute.jsx";
import CreateInstituteAdmin from "./CreateInstituteAdmin.jsx";
import ViewLocations from "./ViewLocations.jsx";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import CreateSuperAdmin from "./CreateSuperAdmin.jsx";
import api from "../../utils/api.js";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState("visitors");
  const [universities, setUniversities] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [universityAdmins, setUniversityAdmins] = useState([]);
  const [superAdmins, setSuperAdmins] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [instituteAdmins, setInstituteAdmins] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [selectedInstitute, setSelectedInstitute] = useState(null);
  const [loggedInAdminId, setLoggedInAdminId] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/admin");
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = localStorage.getItem("token");

        try {
          const user = JSON.parse(localStorage.getItem("user"));
          if (user && (user._id || user.userId)) {
            setLoggedInAdminId(user._id || user.userId);
          }
        } catch (error) {
          console.error("Error parsing user:", error);
        }

        const [uniRes, visRes, adminRes, superAdminRes] = await Promise.all([
          api.get("/super-admin/universities", {
            headers: { "x-auth-token": token },
          }),
          api.get("/visitors", { headers: { "x-auth-token": token } }),
          api.get("/super-admin/university-admins", {
            headers: { "x-auth-token": token },
          }),
          api.get("/super-admin/super-admins", {
            headers: { "x-auth-token": token },
          }),
        ]);

        setUniversities(uniRes.data);
        setVisitors(visRes.data);
        setUniversityAdmins(adminRes.data);
        setSuperAdmins(superAdminRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
          handleLogout();
        } else {
          toast.error("Failed to load initial data.");
        }
      }
    };
    fetchInitialData();
  }, []);

  // Prepare visitor chart data
  const prepareVisitorCharts = () => {
    // Visitors by date
    const visitorsByDate = visitors.reduce((acc, visitor) => {
      const date = new Date(visitor.createdAt).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Visitors by university
    const visitorsByUniversity = visitors.reduce((acc, visitor) => {
      const universityName = visitor.university?.name || "Unknown University";
      acc[universityName] = (acc[universityName] || 0) + 1;
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
      universityData: {
        labels: Object.keys(visitorsByUniversity),
        datasets: [
          {
            data: Object.values(visitorsByUniversity),
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

  const fetchSuperAdmins = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await api.get("/super-admin/super-admins", {
        headers: { "x-auth-token": token },
      });
      setSuperAdmins(data);
    } catch (error) {
      console.error("Error fetching super admins:", error);
      toast.error("Failed to fetch super admins.");
    }
  };

  const fetchInstitutes = async (universityId) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await api.get(`/university/${universityId}/institutes`, {
        headers: { "x-auth-token": token },
      });
      setInstitutes(data);
    } catch (error) {
      console.error("Error fetching institutes:", error);
      toast.error("Failed to fetch institutes.");
    }
  };

  const fetchInstituteAdmins = async (instituteId) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await api.get(`/institute/${instituteId}/admins`, {
        headers: { "x-auth-token": token },
      });
      setInstituteAdmins(data);
    } catch (error) {
      console.error("Error fetching institute admins:", error);
      toast.error("Failed to fetch institute admins.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await api.get("/super-admin/university-admins", {
          headers: { "x-auth-token": token },
        });
        setUniversityAdmins(data);
      } catch (error) {
        console.error("Error fetching admins:", error);
        toast.error("Failed to fetch university admins.");
      }
    };

    if (activeTab === "university-admins") {
      fetchData();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "super-admins") {
      fetchSuperAdmins();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "institute-admins" || activeTab === "locations") {
      if (!selectedUniversity) {
        toast("Please select a university from the Institutes tab first", {
          icon: "ℹ️",
          duration: 4000,
          style: {
            background: "#dbeafe",
            color: "#1e40af",
            padding: "16px",
            fontSize: "16px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          },
        });
      }
    }
  }, [activeTab, selectedUniversity]);

  const filteredSuperAdmins = superAdmins.filter(
    (admin) => admin._id !== loggedInAdminId
  );

  const tabs = [
    { id: "visitors", label: "Visitors", icon: "👥", count: visitors.length },
    {
      id: "super-admins",
      label: "Super Admins",
      icon: "👑",
      count: superAdmins.length,
    },
    {
      id: "universities",
      label: "Universities",
      icon: "🏛️",
      count: universities.length,
    },
    {
      id: "university-admins",
      label: "Uni Admins",
      icon: "🏫",
      count: universityAdmins.length,
    },
    {
      id: "institutes",
      label: "Institutes",
      icon: "🏢",
      count: institutes.length,
    },
    {
      id: "institute-admins",
      label: "Inst Admins",
      icon: "💼",
      count: instituteAdmins.length,
    },
    { id: "locations", label: "Locations", icon: "📍" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Title and Mobile Menu Button */}
            <div className="flex items-center space-x-3">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>

              <div className="flex items-center space-x-3">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">
                  🛡️ Super Admin Dashboard
                </h1>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm md:text-base"
            >
              <span>🚪</span>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-800">Menu</h2>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 text-left transition-all ${
                  activeTab === tab.id
                    ? "bg-blue-100 text-blue-600 border-l-4 border-blue-600"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileMenuOpen(false);
                }}
              >
                <span className="text-xl">{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="ml-auto bg-gray-200 text-gray-700 rounded-full px-2 py-1 text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:block bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <nav
            className="flex space-x-8 overflow-x-auto py-2"
            aria-label="Tabs"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 whitespace-nowrap
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Tab Content */}
        <div className="tab-content">
          {/* Visitors Tab */}
          {activeTab === "visitors" && (
            <div className="bg-white rounded-2xl shadow-lg">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">👥</span>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Visitor Records
                      </h2>
                      <p className="text-sm text-gray-600">
                        All visitors across all universities
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
                            legend: { position: "top" },
                            title: { display: true, text: "Visitors per Day" },
                          },
                        }}
                      />
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Visitors by University
                    </h3>
                    <div className="h-64">
                      <Pie
                        data={visitorCharts.universityData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { position: "right" } },
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {[
                        "Name",
                        "Contact",
                        "Purpose",
                        "University",
                        "Institute",
                        "Visit Date",
                        "Actions",
                      ].map((header) => (
                        <th
                          key={header}
                          className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {visitors.map((visitor) => (
                      <tr key={visitor._id} className="hover:bg-gray-50">
                        <td className="px-4 sm:px-6 py-4 font-medium text-sm">
                          {visitor.name}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-sm">
                          <div className="text-gray-600">{visitor.email}</div>
                          <div className="text-gray-500">{visitor.mobile}</div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-sm">
                          {visitor.purpose}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-sm">
                          {visitor.university?.name || "N/A"}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-sm">
                          {visitor.institute?.name || "N/A"}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-sm whitespace-nowrap">
                          {new Date(visitor.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <button
                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                            onClick={async () => {
                              if (
                                window.confirm("Delete this visitor record?")
                              ) {
                                await api.delete(`/visitors/${visitor._id}`, {
                                  headers: {
                                    "x-auth-token":
                                      localStorage.getItem("token"),
                                  },
                                });
                                setVisitors(
                                  visitors.filter((v) => v._id !== visitor._id)
                                );
                                toast.success("Visitor deleted");
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
            </div>
          )}

          {activeTab === "super-admins" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              <CreateSuperAdmin setSuperAdmins={setSuperAdmins} />
              <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
                <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center gap-2">
                  👑 Existing Super Admins
                </h2>

                <div className="overflow-x-auto rounded-lg border border-gray-100">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
                        <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {superAdmins.map((admin) => {
                        const isCurrentUser = admin.isCurrentUser;
                        const isLastSuperAdmin = superAdmins.length === 1;

                        return (
                          <tr key={admin._id} className="hover:bg-gray-50">
                            <td className="px-3 md:px-6 py-4 font-medium text-sm md:text-base">
                              {admin.email}
                            </td>
                            <td className="px-3 md:px-6 py-4">
                              {isCurrentUser && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Current User
                                </span>
                              )}
                            </td>
                            <td className="px-3 md:px-6 py-4">
                              {isCurrentUser ? (
                                <span className="text-gray-400 text-xs md:text-sm">
                                  Cannot delete yourself
                                </span>
                              ) : isLastSuperAdmin ? (
                                <span className="text-gray-400 text-xs md:text-sm">
                                  Last super admin
                                </span>
                              ) : (
                                <button
                                  className="text-red-500 hover:text-red-700 transition-colors text-sm font-medium"
                                  onClick={async () => {
                                    if (
                                      window.confirm(
                                        `Delete super admin: ${admin.email}?`
                                      )
                                    ) {
                                      try {
                                        console.log(
                                          "Deleting admin:",
                                          admin._id
                                        );

                                        await api.delete(
                                          `/super-admin/super-admins/${admin._id}`,
                                          {
                                            headers: {
                                              "x-auth-token":
                                                localStorage.getItem("token"),
                                            },
                                          }
                                        );

                                        setSuperAdmins((prev) =>
                                          prev.filter(
                                            (a) => a._id !== admin._id
                                          )
                                        );

                                        toast.success(
                                          "Super Admin deleted successfully"
                                        );
                                        console.log(
                                          "Success toast should show now"
                                        );
                                      } catch (error) {
                                        console.error("Delete error:", error);

                                        const status = error.response?.status;
                                        const backendMessage =
                                          error.response?.data?.message;

                                        let errorMessage =
                                          "Failed to delete admin";

                                        switch (status) {
                                          case 403:
                                            errorMessage =
                                              backendMessage ||
                                              "You don't have permission to delete this admin";
                                            break;
                                          case 400:
                                            errorMessage =
                                              backendMessage ||
                                              "Cannot delete the last super admin";
                                            break;
                                          case 401:
                                            errorMessage =
                                              "Authentication failed. Please login again";
                                            break;
                                          default:
                                            errorMessage =
                                              backendMessage ||
                                              "Failed to delete admin. Please try again";
                                        }

                                        toast.error(errorMessage);
                                        console.log(
                                          "Error toast should show:",
                                          errorMessage
                                        );
                                      }
                                    }
                                  }}
                                >
                                  Delete
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {superAdmins.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No super admins found
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "universities" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              <CreateUniversity setUniversities={setUniversities} />
              <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
                <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center gap-2">
                  🏛️ Existing Universities
                </h2>
                <div className="overflow-x-auto rounded-lg border border-gray-100">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Logo
                        </th>
                        <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {universities.map((university) => (
                        <tr key={university._id} className="hover:bg-gray-50">
                          <td className="px-3 md:px-6 py-4 font-medium text-sm md:text-base">
                            {university.name}
                          </td>
                          <td className="px-3 md:px-6 py-4">
                            <img
                              src={university.logo}
                              alt="Logo"
                              className="h-10 w-10 md:h-12 md:w-12 object-contain bg-gray-100 p-1 rounded"
                            />
                          </td>
                          <td className="px-3 md:px-6 py-4">
                            <button
                              className="text-red-500 hover:text-red-700 text-sm font-medium"
                              onClick={async () => {
                                if (window.confirm("Delete this university?")) {
                                  await api.delete(
                                    `/super-admin/universities/${university._id}`,
                                    {
                                      headers: {
                                        "x-auth-token":
                                          localStorage.getItem("token"),
                                      },
                                    }
                                  );
                                  setUniversities((prev) =>
                                    prev.filter((u) => u._id !== university._id)
                                  );
                                  toast.success("University deleted");
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
              </div>
            </div>
          )}

          {activeTab === "university-admins" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              <CreateUniversityAdmin
                universities={universities}
                setUniversityAdmins={setUniversityAdmins}
              />
              <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
                <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center gap-2">
                  🏫 University Admins
                </h2>
                <div className="overflow-x-auto rounded-lg border border-gray-100">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          University
                        </th>
                        <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {universityAdmins.map((admin) => (
                        <tr key={admin._id} className="hover:bg-gray-50">
                          <td className="px-3 md:px-6 py-4 font-medium text-sm md:text-base">
                            {admin.email}
                          </td>
                          <td className="px-3 md:px-6 py-4 text-sm">
                            {admin.university?.name || "N/A"}
                          </td>
                          <td className="px-3 md:px-6 py-4">
                            <button
                              className="text-red-500 hover:text-red-700 text-sm font-medium"
                              onClick={async () => {
                                if (window.confirm("Delete this admin?")) {
                                  await api.delete(
                                    `/super-admin/university-admins/${admin._id}`,
                                    {
                                      headers: {
                                        "x-auth-token":
                                          localStorage.getItem("token"),
                                      },
                                    }
                                  );
                                  setUniversityAdmins((prev) =>
                                    prev.filter((a) => a._id !== admin._id)
                                  );
                                  toast.success("Admin deleted");
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
              </div>
            </div>
          )}

          {activeTab === "institutes" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
                <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center gap-2">
                  🏢 Manage Institutes
                </h2>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 tracking-wide">
                      Select University
                    </label>
                    <select
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      onChange={(e) => {
                        setSelectedUniversity(e.target.value);
                        fetchInstitutes(e.target.value);
                      }}
                    >
                      <option value="">Select a University</option>
                      {universities.map((uni) => (
                        <option key={uni._id} value={uni._id}>
                          {uni.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedUniversity && (
                    <CreateInstitute
                      universityId={selectedUniversity}
                      setInstitutes={setInstitutes}
                    />
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
                <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center gap-2">
                  🏛️ Institutes List
                </h2>
                <div className="overflow-x-auto rounded-lg border border-gray-100">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          University
                        </th>
                        <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {institutes.map((institute) => (
                        <tr key={institute._id} className="hover:bg-gray-50">
                          <td className="px-3 md:px-6 py-4 font-medium text-sm md:text-base">
                            {institute.name}
                          </td>
                          <td className="px-3 md:px-6 py-4 text-sm">
                            {universities.find(
                              (u) => u._id === institute.university
                            )?.name || "N/A"}
                          </td>
                          <td className="px-3 md:px-6 py-4">
                            <button
                              className="text-red-500 hover:text-red-700 text-sm font-medium"
                              onClick={async () => {
                                if (window.confirm("Delete this institute?")) {
                                  await api.delete(
                                    `/institute/${institute._id}`,
                                    {
                                      headers: {
                                        "x-auth-token":
                                          localStorage.getItem("token"),
                                      },
                                    }
                                  );
                                  setInstitutes((prev) =>
                                    prev.filter((i) => i._id !== institute._id)
                                  );
                                  toast.success("Institute deleted");
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
              </div>
            </div>
          )}

          {activeTab === "institute-admins" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  💼 Create Institute Admin
                </h2>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 tracking-wide">
                      Select Institute
                    </label>
                    <select
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      onChange={(e) => {
                        setSelectedInstitute(e.target.value);
                        fetchInstituteAdmins(e.target.value);
                      }}
                    >
                      <option value="">Select an Institute</option>
                      {institutes.map((inst) => (
                        <option key={inst._id} value={inst._id}>
                          {inst.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedInstitute && (
                    <CreateInstituteAdmin
                      instituteId={selectedInstitute}
                      setInstituteAdmins={setInstituteAdmins}
                    />
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  💼 Institute Admins
                </h2>
                <div className="overflow-x-auto rounded-lg border border-gray-100">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Institute
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {instituteAdmins.map((admin) => (
                        <tr key={admin._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium">
                            {admin.email}
                          </td>
                          <td className="px-6 py-4">
                            {institutes.find((i) => i._id === admin.institute)
                              ?.name || "N/A"}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              className="text-red-500 hover:text-red-700"
                              onClick={async () => {
                                if (window.confirm("Delete this admin?")) {
                                  await api.delete(
                                    `/institute/admins/${admin._id}`,
                                    {
                                      headers: {
                                        "x-auth-token":
                                          localStorage.getItem("token"),
                                      },
                                    }
                                  );
                                  setInstituteAdmins((prev) =>
                                    prev.filter((a) => a._id !== admin._id)
                                  );
                                  toast.success("Admin deleted");
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
