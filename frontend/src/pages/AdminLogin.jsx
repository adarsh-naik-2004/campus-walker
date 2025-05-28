import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({
    email: "super@admin.com",
    password: "admin123",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("/api/auth/login", credentials);

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      if (data.role === "university" && data.university) {
        localStorage.setItem("university", data.university);
      }
      if (data.role === 'institute' && data.institute) {
        localStorage.setItem('institute', data.institute);
      }

      navigate(`/admin/dashboard/${data.role}`);
      toast.success(`Welcome back, ${data.role} admin!`);
    } catch (err) {
      setError("Invalid credentials");
      toast.error("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white px-6 py-8 rounded-2xl shadow-2xl transition-all duration-300">
        <div className="text-center mb-10">
          <div className="mb-4">
            <span className="text-4xl">🛡️</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            Admin Portal
          </h1>
          <p className="mt-2 text-gray-600">Secure access for authorized personnel</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 tracking-wide">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="admin@university.edu"
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 tracking-wide">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="••••••••"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm">{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.02] shadow-md"
          >
            Authenticate
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Restricted access. Unauthorized entry prohibited.</p>
        </div>
      </div>
    </div>
  );
}