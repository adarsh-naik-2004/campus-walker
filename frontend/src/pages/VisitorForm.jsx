import { useState, useEffect } from "react";
import api from "../utils/api";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function VisitorForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    purposeType: "",
    customPurpose: "",
    university: "",
    institute: "",
  });
  const [universities, setUniversities] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState({
    universities: true,
    institutes: false,
  });

  const purposeOptions = [
    "Admission Inquiry",
    "Campus Tour",
    "Alumni Visit",
    "Faculty Meeting",
    "Event Participation",
    "Research Collaboration",
    "Other",
  ];

  // Fetch universities on mount
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const { data } = await api.get("/public/universities");
        setUniversities(data);
      } catch (error) {
        toast.error("Failed to load universities");
      } finally {
        setLoading((prev) => ({ ...prev, universities: false }));
      }
    };
    fetchUniversities();
  }, []);

  // Fetch institutes when university is selected
  useEffect(() => {
    const fetchInstitutes = async () => {
      if (!formData.university) return;

      try {
        setLoading((prev) => ({ ...prev, institutes: true }));
        const { data } = await api.get(
          `/university/${formData.university}/institutes`
        );
        setInstitutes(data);
      } catch (error) {
        toast.error("Failed to load institutes");
      } finally {
        setLoading((prev) => ({ ...prev, institutes: false }));
      }
    };

    fetchInstitutes();
  }, [formData.university]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const finalPurpose =
        formData.purposeType === "Other"
          ? formData.customPurpose
          : formData.purposeType;

      // Save instituteId before making API call
      const selectedInstituteId = formData.institute;

      // Make API call with current formData (before reset)
      await api.post("/visitors", {
        ...formData,
        purpose: finalPurpose,
      });

      // Reset form AFTER successful API call
      setFormData({
        name: "",
        email: "",
        mobile: "",
        purposeType: "",
        customPurpose: "",
        university: "",
        institute: "",
      });

      localStorage.setItem("instituteId", selectedInstituteId);

      toast.success("Registration successful!");

      // Navigate using the saved instituteId
      window.location.href = "/index.html";
    } catch (error) {
      console.error("Registration error:", error); // Add this for debugging
      toast.error(error.response?.data?.message || "Failed to submit form");
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white px-4 py-6 rounded-2xl shadow-2xl w-full max-w-md md:max-w-lg md:px-8 md:py-8 transition-all duration-300">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">
          Visitor Registration
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 tracking-wide">
              Full Name
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder=""
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 tracking-wide">
              Email Address
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder=""
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          {/* Mobile Field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 tracking-wide">
              Mobile Number
            </label>
            <input
              type="tel"
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder=""
              value={formData.mobile}
              onChange={(e) =>
                setFormData({ ...formData, mobile: e.target.value })
              }
            />
          </div>

          {/* University Selection */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 tracking-wide">
              University
            </label>
            <div className="relative">
              <select
                required
                className="w-full px-4 py-2.5 pr-8 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none outline-none transition-all"
                value={formData.university}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    university: e.target.value,
                    institute: "",
                  })
                }
                disabled={loading.universities}
              >
                <option value="">Select University</option>
                {loading.universities ? (
                  <option>Loading universities...</option>
                ) : (
                  universities.map((uni) => (
                    <option key={uni._id} value={uni._id}>
                      {uni.name}
                    </option>
                  ))
                )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Institute Selection */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 tracking-wide">
              Institute
            </label>
            <div className="relative">
              <select
                required
                className="w-full px-4 py-2.5 pr-8 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none outline-none transition-all"
                value={formData.institute}
                onChange={(e) =>
                  setFormData({ ...formData, institute: e.target.value })
                }
                disabled={!formData.university || loading.institutes}
              >
                <option value="">Select Institute</option>
                {loading.institutes ? (
                  <option>Loading institutes...</option>
                ) : (
                  institutes.map((inst) => (
                    <option key={inst._id} value={inst._id}>
                      {inst.name}
                    </option>
                  ))
                )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Purpose Selection */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 tracking-wide">
              Purpose of Visit
            </label>
            <div className="relative">
              <select
                required
                className="w-full px-4 py-2.5 pr-8 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none outline-none transition-all"
                value={formData.purposeType}
                onChange={(e) =>
                  setFormData({ ...formData, purposeType: e.target.value })
                }
              >
                <option value="">Select Purpose</option>
                {purposeOptions.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Custom Purpose Input */}
          {formData.purposeType === "Other" && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 tracking-wide">
                Specify Purpose
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Enter your specific purpose"
                value={formData.customPurpose}
                onChange={(e) =>
                  setFormData({ ...formData, customPurpose: e.target.value })
                }
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.02] shadow-md"
          >
            Register Now
          </button>
        </form>
      </div>
    </div>
  );
}
