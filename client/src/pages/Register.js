import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/api";
import { AuthContext } from "../context/AuthContext";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
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

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    if (formData.password.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    setLoading(true);

    try {
      const res = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      loginUser(res.data.token, res.data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-4 lg:p-8 font-display bg-background-light dark:bg-background-dark">
      <header className="absolute top-0 left-0 right-0 flex items-center justify-between p-6 lg:px-10 lg:py-8">
        <div className="flex items-center gap-3 text-slate-800 dark:text-white">
          <div className="h-6 w-6 text-primary">
            <svg
              fill="currentColor"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_6_319)">
                <path d="M8.57829 8.57829C5.52816 11.6284 3.451 15.5145 2.60947 19.7452C1.76794 23.9758 2.19984 28.361 3.85056 32.3462C5.50128 36.3314 8.29667 39.7376 11.8832 42.134C15.4698 44.5305 19.6865 45.8096 24 45.8096C28.3135 45.8096 32.5302 44.5305 36.1168 42.134C39.7033 39.7375 42.4987 36.3314 44.1494 32.3462C45.8002 28.361 46.2321 23.9758 45.3905 19.7452C44.549 15.5145 42.4718 11.6284 39.4217 8.57829L24 24L8.57829 8.57829Z" />
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
        <div className="hidden items-center gap-9 md:flex">
          <Link
            to="/login"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            Already have an account?{" "}
            <span className="font-bold text-primary">Log In</span>
          </Link>
        </div>
      </header>

      <main className="flex w-full max-w-6xl flex-1 items-center justify-center">
        <div className="grid w-full grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col justify-center space-y-8 px-4">
            <div>
              <div className="flex min-w-72 flex-col gap-2">
                <p className="text-3xl font-black leading-tight tracking-[-0.033em] text-slate-900 dark:text-white md:text-4xl">
                  Start Your Financial Journey
                </p>
                <p className="text-base font-normal leading-normal text-slate-500 dark:text-slate-400">
                  It only takes a minute to get started.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium leading-normal text-slate-600 dark:text-slate-300">
                  Step 1 of 3
                </p>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: "33%" }}
                ></div>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-500 dark:bg-red-900/10 dark:text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                <label className="flex flex-col">
                  <p className="pb-2 text-sm font-medium leading-normal text-slate-800 dark:text-slate-200">
                    Full Name
                  </p>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input h-12 w-full flex-1 resize-none overflow-hidden rounded-lg border border-slate-300 bg-transparent px-4 py-2.5 text-base font-normal leading-normal text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-primary"
                    placeholder="Enter your full name"
                    required
                  />
                </label>
                <label className="flex flex-col">
                  <p className="pb-2 text-sm font-medium leading-normal text-slate-800 dark:text-slate-200">
                    Email Address
                  </p>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input h-12 w-full flex-1 resize-none overflow-hidden rounded-lg border border-slate-300 bg-transparent px-4 py-2.5 text-base font-normal leading-normal text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-primary"
                    placeholder="Enter your email address"
                    required
                  />
                </label>
                <label className="flex flex-col">
                  <p className="pb-2 text-sm font-medium leading-normal text-slate-800 dark:text-slate-200">
                    Password
                  </p>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input h-12 w-full flex-1 resize-none overflow-hidden rounded-lg border border-slate-300 bg-transparent px-4 py-2.5 text-base font-normal leading-normal text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-primary"
                    placeholder="Create a password"
                    required
                  />
                </label>
                <label className="flex flex-col">
                  <p className="pb-2 text-sm font-medium leading-normal text-slate-800 dark:text-slate-200">
                    Confirm Password
                  </p>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="form-input h-12 w-full flex-1 resize-none overflow-hidden rounded-lg border border-slate-300 bg-transparent px-4 py-2.5 text-base font-normal leading-normal text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-primary"
                    placeholder="Confirm your password"
                    required
                  />
                </label>
              </div>

              <div className="flex items-start">
                <div className="flex h-6 items-center">
                  <input
                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-800 dark:ring-offset-slate-900"
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                  />
                </div>
                <div className="ml-3 text-sm leading-6">
                  <label
                    className="text-slate-500 dark:text-slate-400"
                    htmlFor="terms"
                  >
                    By creating an account, you agree to our{" "}
                    <Link
                      to="/terms"
                      className="font-medium text-primary hover:underline"
                    >
                      Terms of Service
                    </Link>
                    .
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center rounded-lg bg-primary px-6 text-base font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating account..." : "Create My Free Account"}
              </button>

              <div className="flex justify-center md:hidden">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  Already have an account?{" "}
                  <span className="font-bold text-primary">Log In</span>
                </Link>
              </div>
            </form>
          </div>

          <div className="hidden items-center justify-center lg:flex">
            <div className="relative flex h-full w-full items-center justify-center rounded-2xl bg-slate-100 p-8 dark:bg-slate-900/50">
              <img
                className="h-full w-full rounded-xl object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjXAvvQo05-7LF9sTiJKJU1amGmUwpm4HC7QQFxzrC9y2-OI5R9VmwBXvBz1YSe7XP6xhza48m4ODK5zC8RU-WZHV06ZWRONBAjWgYBNhacQ2jPGfBurpyYfFNgUUqMKiASRsqgvMm6zc1YX2P53r8s_PLkzbMbfrE5K0H_sKfk00CVhz1a-t4aoXkuD1FCNgXLq-AicWRgWXiBm20mknzSzawNF8iecdk3DEoi3U2oMjJw-ZxZCqvRhgsLOsUib8avcWot11o0FUL"
                alt="An abstract 3D illustration with soft, flowing shapes in pastel colors, representing growth and clarity"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-background-dark/50 to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8 rounded-lg border border-white/10 bg-black/20 p-6 text-white backdrop-blur-lg">
                <h3 className="mb-2 text-xl font-bold">
                  Chart Your Course to Financial Freedom
                </h3>
                <p className="text-sm text-slate-300">
                  PocketPilot makes it simple to track your spending, set goals,
                  and build a brighter financial future. Welcome aboard!
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;
