import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../../utils/api.js";

export default function ViewLocations({
  institutes,
  selectedInstitute,
  setSelectedInstitute,
  refreshTrigger, 
  refreshLocations
}) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [instituteName, setInstituteName] = useState("");


  useEffect(() => {
    if (refreshLocations) {
      fetchLocations();
    }
  }, [refreshLocations]);

  const fetchLocations = async () => {
    if (selectedInstitute) {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        // Get institute name for display
        const institute = institutes.find(inst => inst._id === selectedInstitute);
        setInstituteName(institute?.name || "");
        
        // Fetch locations
        const { data } = await api.get(
          `/institute/${selectedInstitute}/locations`,
          { headers: { "x-auth-token": token } }
        );
        setLocations(data);
      } catch (error) {
        toast.error("Failed to load locations");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [selectedInstitute, refreshTrigger]); // Add refreshTrigger as dependency

  const handleDeleteLocation = async (locationId) => {
    if (window.confirm("Are you sure you want to delete this location?")) {
      try {
        const token = localStorage.getItem("token");
        await api.delete(`/institute/locations/${locationId}`, {
          headers: { "x-auth-token": token }
        });
        setLocations(locations.filter(loc => loc._id !== locationId));
        toast.success("Location deleted successfully");
      } catch (error) {
        toast.error("Failed to delete location");
      }
    }
  };

  // Function to get coordinate values (handles both old and new format)
  const getCoordinateValue = (location, type) => {
    // Check if using new format (x, y, z)
    if (location.coordinates && typeof location.coordinates === 'object') {
      if ('x' in location.coordinates && 'y' in location.coordinates) {
        switch (type) {
          case 'latitude':
            return location.coordinates.y || 0;
          case 'longitude':
            return location.coordinates.x || 0;
          case 'altitude':
            return location.coordinates.z || 0;
          default:
            return 0;
        }
      }
      // Check if using old format (latitude, longitude, altitude)
      if ('latitude' in location.coordinates) {
        return location.coordinates[type] || 0;
      }
    }
    return 0;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <span className="text-2xl">📍</span> Locations
        </h2>
        
        <div className="w-full md:w-64 mt-4 md:mt-0">
          <label className="text-sm font-semibold text-gray-700 mb-1 block">
            Select Institute
          </label>
          <select
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            value={selectedInstitute || ""}
            onChange={(e) => setSelectedInstitute(e.target.value)}
          >
            <option value="">All Institutes</option>
            {institutes.map((inst) => (
              <option key={inst._id} value={inst._id}>
                {inst.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedInstitute && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-bold text-blue-800">
            {instituteName || "Selected Institute"} Locations
          </h3>
          <p className="text-sm text-blue-600 mt-1">
            {locations.length} location(s) found
          </p>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-100">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Loading locations...</p>
          </div>
        ) : locations.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Floor
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Coordinates
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {locations.map((location) => (
                <tr key={location._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">
                    <div className="font-bold text-gray-800">{location.name}</div>
                    <div className="text-xs text-gray-500">
                      {location.institute?.name || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {location.image ? (
                      <div className="w-16 h-16 rounded-lg overflow-hidden border">
                        <img 
                          src={location.image} 
                          alt={location.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 border rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-2xl">🏢</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-800">{location.name}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {location.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 capitalize">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {location.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                      {location.floor}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="flex items-baseline gap-1">
                        <span className="text-gray-500 w-20">Latitude:</span>
                        <span className="font-mono">
                          {getCoordinateValue(location, 'latitude').toFixed(6)}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-gray-500 w-20">Longitude:</span>
                        <span className="font-mono">
                          {getCoordinateValue(location, 'longitude').toFixed(6)}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-gray-500 w-20">Altitude:</span>
                        <span className="font-mono">
                          {getCoordinateValue(location, 'altitude').toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      className="text-red-500 hover:text-red-700 px-3 py-1 rounded hover:bg-red-50 transition-colors"
                      onClick={() => handleDeleteLocation(location._id)}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-gray-500">
            {selectedInstitute 
              ? "No locations found for selected institute" 
              : "Select an institute to view locations"}
          </div>
        )}
      </div>
    </div>
  );
}