import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getGoals,
  createGoal,
  deleteGoal,
  getGoalRecommendations,
} from "../services/api";
import "./Goals.css";

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [selectedGoalRec, setSelectedGoalRec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    targetAmount: "",
    deadline: "",
    category: "other",
    priority: "medium",
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const res = await getGoals();
      setGoals(res.data.goals);
    } catch (error) {
      console.error("Error fetching goals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createGoal(formData);
      setShowModal(false);
      setFormData({
        title: "",
        targetAmount: "",
        deadline: "",
        category: "other",
        priority: "medium",
      });
      fetchGoals();
    } catch (error) {
      console.error("Error creating goal:", error);
      alert("Failed to create goal");
    }
  };

  const handleViewRecommendations = async (goalId) => {
    try {
      const res = await getGoalRecommendations(goalId);
      setSelectedGoalRec(res.data.recommendations);
      setShowRecommendations(true);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this goal?")) {
      try {
        await deleteGoal(id);
        fetchGoals();
      } catch (error) {
        console.error("Error deleting goal:", error);
      }
    }
  };

  if (loading) return <div className="loading">Loading goals...</div>;

  return (
    <div className="flex min-h-screen w-full font-display">
      {/* SideNavBar */}
      <aside className="flex w-64 flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111318] p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
              style={{
                backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuDs1Tp9AldYyiX7DPp46Oxs2xJjFj7Ii3tmOHCwKoReGa8Dl4kdOT2giY18bHdUHUa3FxJdI1dR2c47gNooVB5C1hDGYzVTqLMGIQNnN_eIyqzG4Nd1XnWsPXPStKB-hIt3jISTF_uNNO-fa7-J8F9lZdhk725w387sOb-Kao15HziqRwUcQHQIIrpWHG3xHncp_hBm0sqYkiCgLxGKrRYEvqqYBc_-AvaYaV8SZwdrSQSCRwYH77FBP2-xIcttsSxfwMDaKg89G8oS")`,
              }}
            />
            <div className="flex flex-col">
              <h1 className="text-gray-900 dark:text-white text-base font-bold leading-normal">
                PocketPilot
              </h1>
              <p className="text-gray-500 dark:text-[#9da6b9] text-sm font-normal leading-normal">
                Welcome Back!
              </p>
            </div>
          </div>
          <nav className="mt-4 flex flex-col gap-2">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <span className="material-symbols-outlined">dashboard</span>
              <p className="text-sm font-medium leading-normal">Dashboard</p>
            </Link>
            <Link
              to="/expenses"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <span className="material-symbols-outlined">receipt_long</span>
              <p className="text-sm font-medium leading-normal">Expenses</p>
            </Link>
            <Link
              to="/goals"
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary dark:bg-primary/20"
            >
              <span className="material-symbols-outlined">pie_chart</span>
              <p className="text-sm font-medium leading-normal">Goals</p>
            </Link>
            <Link
              to="/analytics"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <span className="material-symbols-outlined">assessment</span>
              <p className="text-sm font-medium leading-normal">Reports</p>
            </Link>
          </nav>
        </div>
        <div className="mt-auto flex flex-col gap-1">
          <Link
            to="/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <span className="material-symbols-outlined">settings</span>
            <p className="text-sm font-medium leading-normal">Settings</p>
          </Link>
          <Link
            to="/help"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <span className="material-symbols-outlined">help</span>
            <p className="text-sm font-medium leading-normal">Help</p>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          {/* Page Heading and Action Button */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <p className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em] min-w-72">
              Reach Your Milestones
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-white gap-2 pl-4 text-base font-bold leading-normal tracking-[0.015em] shadow-lg shadow-primary/30 hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined">add</span>
              <span className="truncate">Add New Goal</span>
            </button>
          </div>

          {/* Active Goals Section */}
          <div className="mb-12">
            <h2 className="text-slate-900 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              Active Goals
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {goals.length > 0 ? (
                goals.map((goal) => (
                  <div
                    key={goal._id}
                    className="flex flex-col rounded-xl shadow-sm bg-white dark:bg-[#1c1f27] overflow-hidden p-6 gap-4 border border-slate-200 dark:border-slate-800"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <p className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                          {goal.title}
                        </p>
                        <p className="text-slate-500 dark:text-[#9da6b9] text-sm font-normal leading-normal">
                          {goal.daysRemaining} days left
                        </p>
                      </div>
                      <div
                        className={`p-2 bg-primary/10 rounded-full text-primary`}
                      >
                        <span className="material-symbols-outlined">
                          savings
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                      <div
                        className="bg-primary h-2.5 rounded-full"
                        style={{ width: `${Math.min(goal.progress, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex items-end justify-between">
                      <p className="text-slate-600 dark:text-[#9da6b9] text-base font-normal leading-normal">
                        <span className="font-bold text-slate-800 dark:text-white">
                          ₹{goal.currentAmount.toLocaleString()}
                        </span>{" "}
                        / ₹{goal.targetAmount.toLocaleString()}
                      </p>
                      <p className="text-primary font-bold text-lg">
                        {goal.progress.toFixed(1)}%
                      </p>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleViewRecommendations(goal._id)}
                        className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1c1f27] px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <span className="material-symbols-outlined">
                          analytics
                        </span>
                        View Plan
                      </button>
                      <button
                        onClick={() => handleDelete(goal._id)}
                        className="flex items-center justify-center rounded-lg border border-red-200 dark:border-red-800/30 bg-red-50 dark:bg-red-500/10 p-2 text-red-600 dark:text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20"
                      >
                        <span className="material-symbols-outlined">
                          delete
                        </span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 rounded-full bg-primary/10 p-3 text-primary">
                    <span className="material-symbols-outlined text-3xl">
                      flag
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    No goals yet. Set your first financial goal!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Add Goal Modal */}
          {showModal && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div
                  className="fixed inset-0 bg-black/50 transition-opacity"
                  onClick={() => setShowModal(false)}
                />
                <div className="inline-block transform overflow-hidden rounded-xl bg-white dark:bg-[#1c1f27] text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
                  <div className="px-6 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 sm:mx-0 sm:h-10 sm:w-10">
                        <span className="material-symbols-outlined text-primary">
                          flag
                        </span>
                      </div>
                      <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                        <h3 className="text-xl font-bold leading-6 text-slate-900 dark:text-white">
                          Set Financial Goal
                        </h3>
                        <form
                          onSubmit={handleSubmit}
                          className="mt-6 space-y-4"
                        >
                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                              Goal Title
                            </label>
                            <input
                              type="text"
                              placeholder="e.g., Buy a laptop"
                              value={formData.title}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  title: e.target.value,
                                })
                              }
                              required
                              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                              Target Amount (₹)
                            </label>
                            <input
                              type="number"
                              value={formData.targetAmount}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  targetAmount: e.target.value,
                                })
                              }
                              required
                              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                              Deadline
                            </label>
                            <input
                              type="date"
                              value={formData.deadline}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  deadline: e.target.value,
                                })
                              }
                              required
                              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                              Priority
                            </label>
                            <select
                              value={formData.priority}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  priority: e.target.value,
                                })
                              }
                              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      type="submit"
                      onClick={handleSubmit}
                      className="inline-flex w-full justify-center rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 sm:ml-3 sm:w-auto"
                    >
                      Create Goal
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 sm:mt-0 sm:w-auto"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations Modal */}
          {showRecommendations && selectedGoalRec && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div
                  className="fixed inset-0 bg-black/50 transition-opacity"
                  onClick={() => setShowRecommendations(false)}
                />
                <div className="inline-block transform overflow-hidden rounded-xl bg-white dark:bg-[#1c1f27] text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:align-middle">
                  <div className="px-6 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 sm:mx-0 sm:h-10 sm:w-10">
                        <span className="material-symbols-outlined text-primary">
                          lightbulb
                        </span>
                      </div>
                      <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                        <h3 className="text-xl font-bold leading-6 text-slate-900 dark:text-white">
                          Budget Recommendations
                        </h3>
                        <div className="mt-6 space-y-6">
                          {/* Summary Section */}
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                Required Monthly
                              </p>
                              <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                                ₹
                                {selectedGoalRec.requiredMonthlySavings?.toLocaleString()}
                              </p>
                            </div>
                            <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                Current Spending
                              </p>
                              <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                                ₹
                                {selectedGoalRec.currentMonthlySpending?.toLocaleString()}
                              </p>
                            </div>
                            <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                Target Spending
                              </p>
                              <p className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-500">
                                ₹
                                {selectedGoalRec.targetMonthlySpending?.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          {/* Category Reductions */}
                          {selectedGoalRec.categoryReductions &&
                            selectedGoalRec.categoryReductions.length > 0 && (
                              <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                                <h4 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
                                  Suggested Reductions
                                </h4>
                                <div className="space-y-3">
                                  {selectedGoalRec.categoryReductions.map(
                                    (item, idx) => (
                                      <div
                                        key={idx}
                                        className="flex items-center justify-between"
                                      >
                                        <div className="flex items-center gap-2">
                                          <span
                                            className={`inline-block h-2 w-2 rounded-full bg-${item.category}-500`}
                                          ></span>
                                          <span className="text-sm font-medium text-slate-900 dark:text-white capitalize">
                                            {item.category}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                          <span className="text-sm text-slate-500 dark:text-slate-400">
                                            ₹
                                            {item.currentSpending.toLocaleString()}
                                          </span>
                                          <span className="text-sm font-medium text-red-600 dark:text-red-500">
                                            -₹
                                            {item.suggestedReduction.toLocaleString()}
                                          </span>
                                          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-500">
                                            ₹{item.newBudget.toLocaleString()}
                                          </span>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                          {/* Insights */}
                          {selectedGoalRec.insights &&
                            selectedGoalRec.insights.length > 0 && (
                              <div className="space-y-2">
                                {selectedGoalRec.insights.map(
                                  (insight, idx) => (
                                    <div
                                      key={idx}
                                      className="rounded-lg bg-primary/5 p-4 text-sm text-primary dark:bg-primary/10"
                                    >
                                      {insight.message}
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 sm:mt-0 sm:w-auto"
                      onClick={() => setShowRecommendations(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Goals;
