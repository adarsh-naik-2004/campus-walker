// src/pages/admin/AddPath.jsx
import { useState } from "react";
import { toast } from "react-hot-toast";
import api from "../../utils/api";

export default function AddPath({ instituteId, locations, setPaths }) {
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    distance: "",
    estimatedTime: "",
    accessibilityFriendly: true,
  });
  const [loading, setLoading] = useState(false);

  // Filter locations that are active and belong to the institute
  const validLocations = locations.filter((loc) => loc.isActive);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.from === formData.to) {
      toast.error("Start and end locations cannot be the same");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const { data } = await api.post(
        "/institute/paths",
        { ...formData, instituteId },
        { headers: { "x-auth-token": token } }
      );

      toast.success("Route added successfully!");
      setPaths((prev) => [...prev, data]);
      setFormData({
        from: "",
        to: "",
        accessibilityFriendly: true,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding route");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span className="text-2xl">🛣️</span> Add New Route
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* From Location */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 tracking-wide">
            Start Location
          </label>
          <select
            required
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            value={formData.from}
            onChange={(e) => setFormData({ ...formData, from: e.target.value })}
          >
            <option value="">Select starting point</option>
            {validLocations.map((location) => (
              <option key={location._id} value={location._id}>
                {location.name} (Floor: {location.floor})
              </option>
            ))}
          </select>
        </div>

        {/* To Location */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 tracking-wide">
            End Location
          </label>
          <select
            required
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            value={formData.to}
            onChange={(e) => setFormData({ ...formData, to: e.target.value })}
          >
            <option value="">Select destination</option>
            {validLocations.map((location) => (
              <option key={location._id} value={location._id}>
                {location.name} (Floor: {location.floor})
              </option>
            ))}
          </select>
        </div>

        {/* Distance */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 tracking-wide">
            Distance (in meters)
          </label>
          <input
            type="number"
            required
            min="0"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            value={formData.distance}
            onChange={(e) =>
              setFormData({ ...formData, distance: e.target.value })
            }
            placeholder="Enter distance between locations"
          />
        </div>

        {/* Estimated Time */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 tracking-wide">
            Estimated Time (in minutes)
          </label>
          <input
            type="number"
            required
            min="0"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            value={formData.estimatedTime}
            onChange={(e) =>
              setFormData({ ...formData, estimatedTime: e.target.value })
            }
            placeholder="Enter time to travel this path"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3.5 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-[1.02] shadow-md disabled:opacity-50 disabled:hover:scale-100"
        >
          {loading ? "Adding Route..." : "Add Route"}
        </button>
      </form>
    </div>
  );
}
