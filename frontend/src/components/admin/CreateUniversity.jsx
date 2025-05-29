// CreateUniversity.jsx
import { useState } from "react";
import { toast } from "react-hot-toast";
import api from '../../utils/api';

export default function CreateUniversity() {
  const [formData, setFormData] = useState({ name: "", logo: null });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formPayload = new FormData();
      formPayload.append("name", formData.name);
      formPayload.append("logo", formData.logo);

      const { data } = await api.post("/super-admin/universities", formPayload, {
        headers: {
          "Content-Type": "multipart/form-data",
          "x-auth-token": localStorage.getItem("token"),
        },
      });

      toast.success("University created successfully! 🎓");
      setFormData({ name: "", logo: null });
    } catch (error) {
      toast.error(error.response?.data?.message || "University creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span className="text-2xl">🏫</span> Create New University
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 tracking-wide">
            University Name
          </label>
          <input
            type="text"
            required
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="Prestige University"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 tracking-wide">
            University Logo
          </label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col w-full cursor-pointer">
              <div className="px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-all group">
                <div className="flex flex-col items-center justify-center text-center">
                  <svg
                    className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-sm text-gray-600">
                    {formData.logo ? (
                      <span className="font-medium text-blue-600">
                        {formData.logo.name}
                      </span>
                    ) : (
                      <>
                        <span className="font-semibold">Click to upload</span> or
                        drag and drop
                      </>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG up to 5MB
                  </p>
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                required
                className="hidden"
                onChange={(e) =>
                  setFormData({ ...formData, logo: e.target.files[0] })
                }
              />
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.02] shadow-md disabled:opacity-50 disabled:hover:scale-100"
        >
          {loading ? "Creating University..." : "Create University"}
        </button>
      </form>
    </div>
  );
}