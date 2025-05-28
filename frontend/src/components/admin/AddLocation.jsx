import { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'

export default function AddLocation({ instituteId }) {
  const [formData, setFormData] = useState({
    name: '',
    floor: 1,
    category: 'building',
    coordinates: { x: 0, y: 0, z: 0 }
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { data } = await axios.post('/api/institute/locations', 
        {
          ...formData,
          instituteId,
          coordinates: {
            x: parseFloat(formData.coordinates.x),
            y: parseFloat(formData.coordinates.y),
            z: parseFloat(formData.coordinates.z)
          }
        },
        { headers: { 'x-auth-token': localStorage.getItem('token') } }
      )
      toast.success('Location added successfully!')
      setFormData({
        name: '',
        floor: 1,
        category: 'building',
        coordinates: { x: 0, y: 0, z: 0 }
      })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error adding location')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span className="text-2xl">📍</span> Add New Location
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 tracking-wide">Name</label>
          <input
            type="text"
            required
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="Academic Block A2"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        {/* Category Selector */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 tracking-wide">Category</label>
          <select
            required
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            <option value="building">Building</option>
            <option value="entrance">Entrance</option>
            <option value="parking">Parking</option>
            <option value="landmark">Landmark</option>
            <option value="facility">Facility</option>
            <option value="emergency">Emergency</option>
          </select>
        </div>

        {/* Floor Input */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 tracking-wide">Floor</label>
          <input
            type="number"
            min="0"
            required
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            value={formData.floor}
            onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
          />
        </div>

        {/* Coordinate Inputs */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 tracking-wide">Coordinates</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {['x', 'y', 'z'].map((axis) => (
              <div key={axis} className="relative">
                <input
                  type="number"
                  step="any"
                  required={axis !== 'z'}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder={`${axis.toUpperCase()} axis`}
                  value={formData.coordinates[axis]}
                  onChange={(e) => setFormData({
                    ...formData,
                    coordinates: { 
                      ...formData.coordinates, 
                      [axis]: e.target.value 
                    }
                  })}
                />
                <span className="absolute right-3 top-3.5 text-gray-500 font-mono">
                  {axis.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Note: X = Longitude, Y = Latitude, Z = Altitude
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.02] shadow-md disabled:opacity-50 disabled:hover:scale-100"
        >
          {loading ? 'Adding Location...' : 'Add Location'}
        </button>
      </form>
    </div>
  )
}