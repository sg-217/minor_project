import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/api";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await login(formData);
      loginUser(res.data.token, res.data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden font-display bg-neutral-light-gray dark:bg-background-dark">
      <div className="layout-container flex h-full grow flex-col">
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-10 p-6 lg:px-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-neutral-dark-gray dark:text-white">
              <div className="size-6 text-action-primary">
                <svg
                  fill="none"
                  viewBox="0 0 48 48"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_6_319)">
                    <path
                      d="M8.57829 8.57829C5.52816 11.6284 3.451 15.5145 2.60947 19.7452C1.76794 23.9758 2.19984 28.361 3.85056 32.3462C5.50128 36.3314 8.29667 39.7376 11.8832 42.134C15.4698 44.5305 19.6865 45.8096 24 45.8096C28.3135 45.8096 32.5302 44.5305 36.1168 42.134C39.7033 39.7375 42.4987 36.3314 44.1494 32.3462C45.8002 28.361 46.2321 23.9758 45.3905 19.7452C44.549 15.5145 42.4718 11.6284 39.4217 8.57829L24 24L8.57829 8.57829Z"
                      fill="currentColor"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_6_319">
                      <rect fill="white" height="48" width="48" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <h2 className="text-xl font-bold leading-tight tracking-[-0.015em]">
                PocketPilot
              </h2>
            </div>
            <Link
              to="/register"
              className="flex min-w-[84px] max-w-[480px] items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-transparent text-neutral-dark-gray dark:text-white text-sm font-bold leading-normal tracking-[0.015em] border border-neutral-dark-gray/20 dark:border-white/20 hover:bg-neutral-dark-gray/5 dark:hover:bg-white/5 transition-colors"
            >
              <span className="truncate">Sign Up</span>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex min-h-screen flex-1">
          <div className="flex flex-col lg:flex-row w-full">
            {/* Left Column - Hidden on mobile */}
            <div className="relative flex-1 hidden lg:flex items-center justify-center bg-gray-100 dark:bg-background-dark/50 p-10">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-10 dark:opacity-20"
                style={{
                  backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCuU6i1D5-s7wQwSpSPbNqoX6gURWyiE_CTVXl6I8LC5-0Fpfz_Mvtzzi8nWvaZ16KlRA1uA0CzoSfvla64naWxGMDtd67JwhqKuz-H5vzXIsspSXObc-OMuvSllGJSWRWL6WccGHCMYLmKAu735k43JHGE3yWMKAXob7nmfBkXLf0dKFoUskX93M1Iz0RICXhX3WQ-lTstP6OSv_gb0tGAQmhkm5AzCpzAtvuV7i0M67_uwu6TAmKHF5m_GAEp90koPgGknXMzdWrW')`,
                }}
              />
              <div className="relative z-10 max-w-md text-center lg:text-left">
                <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] text-neutral-dark-gray dark:text-white md:text-5xl">
                  Welcome Back to PocketPilot
                </h1>
                <p className="mt-4 text-lg font-normal leading-normal text-neutral-dark-gray/80 dark:text-white/80">
                  Take control of your finances. Securely access your financial
                  dashboard and continue your journey to financial freedom.
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-neutral-white dark:bg-background-dark">
              <div className="w-full max-w-md space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-neutral-dark-gray dark:text-white">
                    Log in to your account
                  </h2>
                  <p className="mt-2 text-sm text-neutral-dark-gray/70 dark:text-white/70">
                    Don't have an account?{" "}
                    <Link
                      to="/register"
                      className="font-medium text-action-primary hover:underline"
                    >
                      Sign up
                    </Link>
                  </p>
                </div>

                {error && (
                  <div className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/10 dark:text-red-400 rounded-lg">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="flex flex-col">
                      <p className="text-sm font-medium leading-normal pb-2 text-neutral-dark-gray dark:text-white">
                        Email Address
                      </p>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-neutral-dark-gray dark:text-white focus:outline-0 focus:ring-2 focus:ring-action-primary focus:ring-opacity-50 border border-neutral-light-gray dark:border-[#3b4354] bg-neutral-light-gray dark:bg-[#1c1f27] h-12 placeholder:text-neutral-dark-gray/50 dark:placeholder:text-[#9da6b9] px-4 text-base font-normal leading-normal transition-shadow"
                        placeholder="you@example.com"
                        required
                      />
                    </label>
                  </div>

                  <div>
                    <label className="flex flex-col">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium leading-normal pb-2 text-neutral-dark-gray dark:text-white">
                          Password
                        </p>
                        <Link
                          to="/forgot-password"
                          className="text-sm font-medium text-action-primary hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <div className="flex w-full flex-1 items-stretch rounded-lg">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-l-lg text-neutral-dark-gray dark:text-white focus:outline-0 focus:ring-2 focus:ring-action-primary focus:ring-opacity-50 border border-neutral-light-gray dark:border-[#3b4354] bg-neutral-light-gray dark:bg-[#1c1f27] h-12 placeholder:text-neutral-dark-gray/50 dark:placeholder:text-[#9da6b9] p-4 border-r-0 pr-2 text-base font-normal leading-normal transition-shadow"
                          placeholder="Enter your password"
                          required
                        />
                        <div
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-neutral-dark-gray/60 dark:text-[#9da6b9] flex border border-neutral-light-gray dark:border-[#3b4354] bg-neutral-light-gray dark:bg-[#1c1f27] items-center justify-center pr-3 rounded-r-lg border-l-0 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-xl">
                            {showPassword ? "visibility_off" : "visibility"}
                          </span>
                        </div>
                      </div>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex min-w-[84px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-action-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-action-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-action-primary dark:focus:ring-offset-background-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="truncate">
                      {loading ? "Logging in..." : "Log In"}
                    </span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Login;
