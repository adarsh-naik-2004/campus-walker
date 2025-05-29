import { useEffect, useState } from "react";
import axios from "axios";
import CreateUniversity from "./CreateUniversity.jsx";
import CreateUniversityAdmin from "./CreateUniversityAdmin.jsx";
import CreateInstitute from "./CreateInstitute.jsx";
import CreateInstituteAdmin from "./CreateInstituteAdmin.jsx";
import ViewLocations from "./ViewLocations.jsx";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import CreateSuperAdmin from "./CreateSuperAdmin.jsx";

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
    navigate("/admin"); // Adjust the path to your login route
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Parse user from localStorage once at the start
        try {
          const user = JSON.parse(localStorage.getItem("user"));
          if (user && (user._id || user.userId)) {
            // Check for both _id and userId
            setLoggedInAdminId(user._id || user.userId);
          } else {
            console.warn(
              "User data or user ID/userId not found in localStorage."
            );
            // Consider logging out or redirecting if essential user data is missing
            // handleLogout();
          }
        } catch (error) {
          console.error("Error parsing user from localStorage:", error);
          // handleLogout(); // Consider logging out here if parsing fails
        }

        const [uniRes, visRes, adminRes, superAdminRes] = await Promise.all([
          axios.get("/api/super-admin/universities", {
            headers: { "x-auth-token": token },
          }),
          axios.get("/api/visitors", { headers: { "x-auth-token": token } }),
          axios.get("/api/super-admin/university-admins", {
            headers: { "x-auth-token": token },
          }),
          axios.get("/api/super-admin/super-admins", {
            headers: { "x-auth-token": token },
          }),
        ]);

        setUniversities(uniRes.data);
        setVisitors(visRes.data);
        setUniversityAdmins(adminRes.data);
        setSuperAdmins(superAdminRes.data); // This data already has `isCurrentUser` from backend
      } catch (error) {
        console.error("Error fetching initial data:", error);
        if (error.response && error.response.status === 401) {
          toast.error("Session expired. Please log in again.");
          handleLogout();
        } else {
          toast.error("Failed to load initial data.");
        }
      }
    };
    fetchInitialData();
  }, []);

  const fetchSuperAdmins = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get("/api/super-admin/super-admins", {
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
      const { data } = await axios.get(
        `/api/university/${universityId}/institutes`,
        { headers: { "x-auth-token": token } } // Add headers
      );
      setInstitutes(data);
    } catch (error) {
      console.error("Error fetching institutes:", error);
      toast.error("Failed to fetch institutes.");
    }
  };

  const fetchInstituteAdmins = async (instituteId) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `/api/institute/${instituteId}/admins`,
        { headers: { "x-auth-token": token } } // Add this line
      );
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
        const { data } = await axios.get("/api/super-admin/university-admins", {
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-white shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <span className="text-2xl md:text-3xl">🛡️</span> 
              <span className="hidden sm:inline">Super Admin Dashboard</span>
              <span className="sm:hidden">Admin</span>
            </h1>
          </div>
          
          <button
            onClick={handleLogout}
            className="px-4 py-2 md:px-6 md:py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg font-semibold hover:from-red-700 hover:to-rose-700 transition-all transform hover:scale-[1.02] shadow-md text-sm md:text-base"
          >
            Logout
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
        )}

        {/* Mobile Menu Sidebar */}
        <div className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-gray-800">Menu</h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <nav className="space-y-2">
              {[
                { id: "visitors", label: "Visitors", icon: "👥" },
                { id: "super-admins", label: "Super Admins", icon: "👑" },
                { id: "universities", label: "Universities", icon: "🏛️" },
                { id: "university-admins", label: "University Admins", icon: "🏫" },
                { id: "institutes", label: "Institutes", icon: "🏢" },
                { id: "institute-admins", label: "Institute Admins", icon: "💼" },
                { id: "locations", label: "Locations", icon: "📍" },
              ].map((tab) => (
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
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Desktop Navigation Menu */}
        <div className="hidden md:flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-xl shadow-sm">
          {[
            { id: "visitors", label: "Visitors", icon: "👥" },
            { id: "super-admins", label: "Super Admins", icon: "👑" },
            { id: "universities", label: "Universities", icon: "🏛️" },
            { id: "university-admins", label: "University Admins", icon: "🏫" },
            { id: "institutes", label: "Institutes", icon: "🏢" },
            { id: "institute-admins", label: "Institute Admins", icon: "💼" },
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
              <span className="hidden lg:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Mobile Active Tab Indicator */}
        <div className="md:hidden mb-6 bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {[
                { id: "visitors", icon: "👥" },
                { id: "super-admins", icon: "👑" },
                { id: "universities", icon: "🏛️" },
                { id: "university-admins", icon: "🏫" },
                { id: "institutes", icon: "🏢" },
                { id: "institute-admins", icon: "💼" },
                { id: "locations", icon: "📍" },
              ].find(tab => tab.id === activeTab)?.icon}
            </span>
            <h2 className="text-lg font-semibold text-gray-800">
              {[
                { id: "visitors", label: "Visitors" },
                { id: "super-admins", label: "Super Admins" },
                { id: "universities", label: "Universities" },
                { id: "university-admins", label: "University Admins" },
                { id: "institutes", label: "Institutes" },
                { id: "institute-admins", label: "Institute Admins" },
                { id: "locations", label: "Locations" },
              ].find(tab => tab.id === activeTab)?.label}
            </h2>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-8 md:space-y-12">
          {activeTab === "visitors" && (
            <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center gap-2">
                👥 Visitor Records
              </h2>
              <div className="overflow-x-auto rounded-lg border border-gray-100">
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
                          className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {visitors.map((visitor) => (
                      <tr key={visitor._id} className="hover:bg-gray-50">
                        <td className="px-3 md:px-6 py-4 font-medium text-sm md:text-base">
                          {visitor.name}
                        </td>
                        <td className="px-3 md:px-6 py-4 text-sm">
                          <div className="text-gray-600">{visitor.email}</div>
                          <div className="text-gray-500">{visitor.mobile}</div>
                        </td>
                        <td className="px-3 md:px-6 py-4 text-sm">{visitor.purpose}</td>
                        <td className="px-3 md:px-6 py-4 text-sm">
                          {visitor.university?.name || "N/A"}
                        </td>
                        <td className="px-3 md:px-6 py-4 text-sm">
                          {visitor.institute?.name || "N/A"}
                        </td>
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm">
                          {new Date(visitor.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-3 md:px-6 py-4">
                          <button
                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                            onClick={async () => {
                              if (
                                window.confirm("Delete this visitor record?")
                              ) {
                                await axios.delete(
                                  `/api/visitors/${visitor._id}`,
                                  {
                                    headers: {
                                      "x-auth-token":
                                        localStorage.getItem("token"),
                                    },
                                  }
                                );
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

                                        await axios.delete(
                                          `/api/super-admin/super-admins/${admin._id}`,
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
                                  await axios.delete(
                                    `/api/super-admin/universities/${university._id}`,
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
                                  await axios.delete(
                                    `/api/super-admin/university-admins/${admin._id}`,
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
                                  await axios.delete(
                                    `/api/institute/${institute._id}`,
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
                                  await axios.delete(
                                    `/api/institute/admins/${admin._id}`,
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
