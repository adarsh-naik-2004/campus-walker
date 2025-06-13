import { useState, useEffect, useRef } from 'react'
import api from '../../utils/api'
import { toast } from 'react-hot-toast'
// Mock toast for demo - replace with actual react-hot-toast


export default function AddLocation({ instituteId = 'demo-institute' }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    floor: 1,
    category: 'building',
    coordinates: { x: 0, y: 0, z: 0 }
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markerRef = useRef(null);

  // Load Leaflet dynamically
  useEffect(() => {
    if (showMap && !window.L) {
      // Load Leaflet CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
      document.head.appendChild(link);

      // Load Leaflet JS
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js';
      script.onload = initializeMap;
      document.body.appendChild(script);
    } else if (showMap && window.L) {
      initializeMap();
    }
  }, [showMap]);

  const initializeMap = () => {
    if (!mapRef.current || leafletMapRef.current) return;

    // Small delay to ensure container is fully rendered
    setTimeout(() => {
      // Initialize map centered on Mahesana, Gujarat
      const map = window.L.map(mapRef.current).setView([23.526135, 72.456244], 15);

      // Add OpenStreetMap tiles
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Force map to refresh its size after initialization
      setTimeout(() => {
        map.invalidateSize();
      }, 100);

      // Add click event listener
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        
        // Remove existing marker
        if (markerRef.current) {
          map.removeLayer(markerRef.current);
        }
        
        // Add new marker
        markerRef.current = window.L.marker([lat, lng]).addTo(map);
        
        // Update coordinates (longitude = x, latitude = y, z = 0)
        setFormData(prev => ({
          ...prev,
          coordinates: {
            x: parseFloat(lng.toFixed(6)),
            y: parseFloat(lat.toFixed(6)),
            z: 0
          }
        }));
        
        toast.success(`Coordinates selected: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      });

      leafletMapRef.current = map;

      // If coordinates already exist, show marker
      if (formData.coordinates.x !== 0 || formData.coordinates.y !== 0) {
        const existingMarker = window.L.marker([formData.coordinates.y, formData.coordinates.x]).addTo(map);
        markerRef.current = existingMarker;
        map.setView([formData.coordinates.y, formData.coordinates.x], 15);
      }
    }, 50);
  };

  // Handle map resize when showMap changes
  useEffect(() => {
    if (showMap && leafletMapRef.current) {
      setTimeout(() => {
        leafletMapRef.current.invalidateSize();
      }, 300);
    }
  }, [showMap]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Validate coordinates
    if (formData.coordinates.x === 0 && formData.coordinates.y === 0) {
      toast.error('Please select a location on the map');
      setLoading(false);
      return;
    }
    
    const formPayload = new FormData();
    formPayload.append('name', formData.name);
    formPayload.append('description', formData.description);
    formPayload.append('floor', formData.floor);
    formPayload.append('category', formData.category);
    formPayload.append('instituteId', instituteId);
    formPayload.append('coordinates[x]', formData.coordinates.x);
    formPayload.append('coordinates[y]', formData.coordinates.y);
    formPayload.append('coordinates[z]', formData.coordinates.z);
    
    if (imagePreview) {
      const blob = await fetch(imagePreview).then(r => r.blob());
      formPayload.append('image', blob, 'location-image.jpg');
    }

    try {
      // Simulated API call for demo
      console.log('Form data to submit:', {
        name: formData.name,
        description: formData.description,
        floor: formData.floor,
        category: formData.category,
        coordinates: formData.coordinates,
        hasImage: !!imagePreview
      });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { data } = await api.post(
        '/institute/locations', 
        formPayload,
        { 
          headers: { 
            'x-auth-token': localStorage.getItem('token'),
            'Content-Type': 'multipart/form-data'
          } 
        }
      );
      
      toast.success('Location added successfully!');
      setFormData({
        name: '',
        description: '',
        floor: 1,
        category: 'building',
        coordinates: { x: 0, y: 0, z: 0 }
      });
      setImagePreview(null);
      
      // Clear map marker
      if (markerRef.current && leafletMapRef.current) {
        leafletMapRef.current.removeLayer(markerRef.current);
        markerRef.current = null;
      }
      
    } catch (error) {
      toast.error('Error adding location');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span className="text-2xl">📍</span> Add New Location
      </h2>
      
      <div className="space-y-6">
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

        {/* Description Field */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 tracking-wide">Description</label>
          <textarea
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
            placeholder="Describe this location..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows="3"
          />
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 tracking-wide">Location Image</label>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleImageChange}
              />
              <div className="px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg text-center bg-gray-50 hover:bg-gray-100 transition-colors">
                <p className="text-gray-500">Click to upload image</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG or GIF (Max 5MB)</p>
              </div>
            </div>
            
            {imagePreview && (
              <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* Category and Floor Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>

        {/* Location Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-700 tracking-wide">Location Selection</label>
            <button
              type="button"
              onClick={() => setShowMap(!showMap)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-md"
            >
              <span>🗺️</span>
              {showMap ? 'Hide Map' : 'Select on Map'}
            </button>
          </div>
          
          {/* Interactive Map */}
          {showMap && (
            <div className="border rounded-lg overflow-hidden shadow-lg">
              <div 
                ref={mapRef} 
                className="w-full h-96 relative"
                style={{ 
                  minHeight: '400px',
                  width: '100%',
                  height: '400px'
                }}
              />
              <div className="p-4 bg-gray-50 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <span className="text-blue-600">📍</span>
                  <p className="font-medium">Click anywhere on the map to select coordinates</p>
                </div>
                <p className="text-xs text-gray-500">
                  The selected coordinates will automatically populate the fields below
                </p>
              </div>
            </div>
          )}

          {/* Coordinate Display/Manual Input */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { key: 'x', label: 'Longitude (X)', placeholder: 'e.g., 77.2090', desc: 'East-West position' },
              { key: 'y', label: 'Latitude (Y)', placeholder: 'e.g., 28.6139', desc: 'North-South position' },
            ].map(({ key, label, placeholder, desc }) => (
              <div key={key} className="space-y-2">
                <label className="text-xs font-medium text-gray-600">{label}</label>
                <input
                  type="number"
                  step="any"
                  required={key !== 'z'}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                  placeholder={placeholder}
                  value={formData.coordinates[key]}
                  onChange={(e) => setFormData({
                    ...formData,
                    coordinates: { 
                      ...formData.coordinates, 
                      [key]: parseFloat(e.target.value) || 0
                    }
                  })}
                />
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
          
          {(formData.coordinates.x !== 0 || formData.coordinates.y !== 0) && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <span className="text-green-600 text-lg">✅</span>
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Location Selected
                  </p>
                  <p className="text-xs text-blue-600">
                    Lat: {formData.coordinates.y.toFixed(6)}, Lng: {formData.coordinates.x.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !formData.name || (formData.coordinates.x === 0 && formData.coordinates.y === 0)}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.02] shadow-md disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Adding Location...</span>
            </div>
          ) : (
            'Add Location'
          )}
        </button>
      </div>
    </div>
  )
}