import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  FaBuilding,
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaShieldAlt,
  FaCheckCircle,
} from "react-icons/fa";

const Register: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-600 via-teal-600 to-blue-700 p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-white/10 backdrop-blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-white/10 backdrop-blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white/5 backdrop-blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl shadow-2xl mb-6">
            <FaBuilding className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Join Our Team</h1>
          <p className="text-green-100 text-lg">
            Create your workspace account
          </p>
        </div>

        <div className="bg-white/20 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
          <div className="px-8 py-10">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Create Account
              </h2>
              <p className="text-green-100">
                Fill in your details to get started
              </p>
            </div>

            {error && (
              <div className="bg-red-500/20 backdrop-blur-md border border-red-400/30 text-white p-4 mb-6 rounded-xl">
                <div className="flex items-center">
                  <FaShieldAlt className="mr-3 h-5 w-5" />
                  <p className="font-medium">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-white mb-2"
                >
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-green-200" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-green-200 focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-white mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-green-200" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-green-200 focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-white mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-green-200" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-12 pr-12 py-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-green-200 focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-green-200 hover:text-white transition-colors duration-200"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5" />
                    ) : (
                      <FaEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <p className="mt-2 text-xs text-green-200">
                  Must be at least 8 characters
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold text-white mb-2"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaCheckCircle className="h-5 w-5 text-green-200" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-12 pr-12 py-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-green-200 focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-green-200 hover:text-white transition-colors duration-200"
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash className="h-5 w-5" />
                    ) : (
                      <FaEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-start space-x-3 pt-2">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="mt-1 h-4 w-4 text-green-600 bg-white/20 border-white/30 rounded focus:ring-green-500 focus:ring-2"
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-green-100 leading-relaxed"
                >
                  I agree to the{" "}
                  <a
                    href="#"
                    className="text-white hover:text-green-200 underline transition-colors duration-200"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-white hover:text-green-200 underline transition-colors duration-200"
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-4 px-6 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl text-white font-semibold hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating your account...
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <FaArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-8 py-6 border-t border-white/20">
            <p className="text-center text-sm text-green-100">
              Already have an account?{" "}
              <a
                href="/login"
                className="font-semibold text-white hover:text-green-200 transition-colors duration-200"
              >
                Sign in here
              </a>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-green-100 text-sm">
            © {new Date().getFullYear()} Room Booking System. All rights
            reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
