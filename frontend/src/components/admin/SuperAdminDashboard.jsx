import { useEffect, useState } from "react";
import axios from "axios";
import CreateUniversity from "./CreateUniversity.jsx";
import CreateUniversityAdmin from "./CreateUniversityAdmin.jsx";
import CreateInstitute from "./CreateInstitute.jsx";
import CreateInstituteAdmin from "./CreateInstituteAdmin.jsx";
import ViewLocations from "./ViewLocations.jsx";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState("visitors");
  const [universities, setUniversities] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [universityAdmins, setUniversityAdmins] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [instituteAdmins, setInstituteAdmins] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [selectedInstitute, setSelectedInstitute] = useState(null);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/admin"); // Adjust the path to your login route
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = localStorage.getItem("token");

        const { data: uniData } = await axios.get(
          "/api/super-admin/universities",
          {
            headers: { "x-auth-token": token },
          }
        );

        const { data: visData } = await axios.get("/api/visitors", {
          headers: { "x-auth-token": token },
        });

        const { data: adminData } = await axios.get(
          "/api/super-admin/university-admins",
          {
            headers: { "x-auth-token": token },
          }
        );

        setVisitors(visData);
        setUniversities(uniData);
        setUniversityAdmins(adminData);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        // Add error handling (e.g., redirect to login if 401)
      }
    };
    fetchInitialData();
  }, []);

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
      }
    };

    if (activeTab === "university-admins") {
      fetchData();
    }
  }, [activeTab]);

  return (
  <div className="min-h-screen bg-gray-50 p-6">
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <span className="text-3xl">🛡️</span> Super Admin Dashboard
        </h1>
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
          { id: "universities", label: "Universities", icon: "🏛️" },
          { id: "university-admins", label: "Uni Admins", icon: "🏫" },
          { id: "institutes", label: "Institutes", icon: "🏢" },
          { id: "institute-admins", label: "Inst Admins", icon: "💼" },
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
                        className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
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
                      <td className="px-6 py-4">
                        {visitor.university?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        {visitor.institute?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(visitor.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          className="text-red-500 hover:text-red-700"
                          onClick={async () => {
                            if (window.confirm("Delete this visitor record?")) {
                              await axios.delete(`/api/visitors/${visitor._id}`, {
                                headers: { "x-auth-token": localStorage.getItem("token") },
                              });
                              setVisitors(visitors.filter((v) => v._id !== visitor._id));
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

        {activeTab === "universities" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <CreateUniversity setUniversities={setUniversities} />
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                🏛️ Existing Universities
              </h2>
              <div className="overflow-x-auto rounded-lg border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Logo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {universities.map((university) => (
                      <tr key={university._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">{university.name}</td>
                        <td className="px-6 py-4">
                          <img
                            src={university.logo}
                            alt="Logo"
                            className="h-12 w-12 object-contain bg-gray-100 p-1 rounded"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={async () => {
                              if (window.confirm("Delete this university?")) {
                                await axios.delete(
                                  `/api/super-admin/universities/${university._id}`,
                                  { headers: { "x-auth-token": localStorage.getItem("token") } }
                                );
                                setUniversities(prev => prev.filter((u) => u._id !== university._id));
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <CreateUniversityAdmin universities={universities} setUniversityAdmins={setUniversityAdmins} />
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                🏫 University Admins
              </h2>
              <div className="overflow-x-auto rounded-lg border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        University
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {universityAdmins.map((admin) => (
                      <tr key={admin._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">{admin.email}</td>
                        <td className="px-6 py-4">
                          {admin.university?.name || "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={async () => {
                              if (window.confirm("Delete this admin?")) {
                                await axios.delete(
                                  `/api/super-admin/university-admins/${admin._id}`,
                                  { headers: { "x-auth-token": localStorage.getItem("token") } }
                                );
                                setUniversityAdmins(prev => prev.filter((a) => a._id !== admin._id));
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
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

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                🏛️ Institutes List
              </h2>
              <div className="overflow-x-auto rounded-lg border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        University
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {institutes.map((institute) => (
                      <tr key={institute._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">{institute.name}</td>
                        <td className="px-6 py-4">
                          {universities.find((u) => u._id === institute.university)?.name || "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={async () => {
                              if (window.confirm("Delete this institute?")) {
                                await axios.delete(
                                  `/api/institute/${institute._id}`,
                                  { headers: { "x-auth-token": localStorage.getItem("token") } }
                                );
                                setInstitutes(prev => prev.filter((i) => i._id !== institute._id));
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
                        <td className="px-6 py-4 font-medium">{admin.email}</td>
                        <td className="px-6 py-4">
                          {institutes.find((i) => i._id === admin.institute)?.name || "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={async () => {
                              if (window.confirm("Delete this admin?")) {
                                await axios.delete(
                                  `/api/institute/admins/${admin._id}`,
                                  { headers: { "x-auth-token": localStorage.getItem("token") } }
                                );
                                setInstituteAdmins(prev => prev.filter((a) => a._id !== admin._id));
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
