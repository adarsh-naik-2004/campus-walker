// CreateInstitute.jsx
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function CreateInstitute({ universityId, setInstitutes }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data } = await axios.post(
        '/api/university/institutes',
        { name, universityId },
        { headers: { 'x-auth-token': localStorage.getItem('token') } }
      );
      
      toast.success('Institute created successfully! 🎉');
      setName('');
      setInstitutes(prev => [...prev, data]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Creation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg mt-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span className="text-2xl">🏛️</span> Create New Institute
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 tracking-wide">Institute Name</label>
          <input
            type="text"
            required
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="Faculty of Engineering"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3.5 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-[1.02] shadow-md disabled:opacity-50 disabled:hover:scale-100"
        >
          {loading ? 'Creating Institute...' : 'Create Institute'}
        </button>
      </form>
    </div>
  );
}