import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import {
  getSummary,
  getTopExpenses,
  getComparison,
  getPredictions,
} from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { format } from "date-fns";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [summary, setSummary] = useState(null);
  const [topExpenses, setTopExpenses] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [summaryRes, topRes, compRes, predRes] = await Promise.all([
        getSummary({ period: "month" }),
        getTopExpenses({ limit: 5, period: "month" }),
        getComparison(),
        getPredictions(),
      ]);

      setSummary(summaryRes.data.summary);
      setTopExpenses(topRes.data.topExpenses);
      setComparison(compRes.data.comparison);
      setPredictions(predRes.data.predictions);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
          <span className="material-symbols-outlined animate-spin">
            refresh
          </span>
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-72 flex-col gap-2">
          <p className="text-gray-900 dark:text-white text-3xl font-bold leading-tight tracking-tight">
            Welcome Back, {user?.name?.split(" ")[0] || "User"}!
          </p>
          <p className="text-gray-500 dark:text-[#9da6b9] text-base font-normal leading-normal">
            Here's your financial overview for this month.
          </p>
        </div>
        <Link
          to="/expenses/add"
          className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-11 px-6 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined text-xl">add</span>
          <span className="truncate">Add Expense</span>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Balance */}
        <div className="flex flex-1 flex-col gap-2 rounded-xl p-6 bg-white dark:bg-[#1c1f27]">
          <p className="text-gray-600 dark:text-[#9da6b9] text-base font-medium leading-normal">
            Total Balance
          </p>
          <p className="text-gray-900 dark:text-white tracking-tight text-3xl font-bold leading-tight">
            ₹{(summary?.total || 0).toLocaleString()}
          </p>
          <p
            className={`text-base font-medium leading-normal ${
              comparison?.percentChange >= 0
                ? "text-[#10B981]"
                : "text-[#EF4444]"
            }`}
          >
            {comparison?.percentChange >= 0 ? "+" : ""}
            {comparison?.percentChange?.toFixed(1)}% vs last month
          </p>
        </div>

        {/* Monthly Expenses */}
        <div className="flex flex-1 flex-col gap-2 rounded-xl p-6 bg-white dark:bg-[#1c1f27]">
          <p className="text-gray-600 dark:text-[#9da6b9] text-base font-medium leading-normal">
            Monthly Expenses
          </p>
          <p className="text-gray-900 dark:text-white tracking-tight text-3xl font-bold leading-tight">
            ₹{(summary?.monthlyExpenses || 0).toLocaleString()}
          </p>
          <p
            className={`text-base font-medium leading-normal ${
              summary?.monthlyTrend >= 0 ? "text-[#EF4444]" : "text-[#10B981]"
            }`}
          >
            {summary?.monthlyTrend >= 0 ? "+" : ""}
            {summary?.monthlyTrend?.toFixed(1)}% vs last month
          </p>
        </div>

        {/* Monthly Savings */}
        <div className="flex flex-1 flex-col gap-2 rounded-xl p-6 bg-white dark:bg-[#1c1f27]">
          <p className="text-gray-600 dark:text-[#9da6b9] text-base font-medium leading-normal">
            Monthly Savings
          </p>
          <p className="text-gray-900 dark:text-white tracking-tight text-3xl font-bold leading-tight">
            ₹{(summary?.monthlySavings || 0).toLocaleString()}
          </p>
          <p
            className={`text-base font-medium leading-normal ${
              summary?.savingsTrend >= 0 ? "text-[#10B981]" : "text-[#EF4444]"
            }`}
          >
            {summary?.savingsTrend >= 0 ? "+" : ""}
            {summary?.savingsTrend?.toFixed(1)}% vs last month
          </p>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <h2 className="text-gray-900 dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">
            Recent Transactions
          </h2>

          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden rounded-xl bg-white dark:bg-[#1c1f27]">
                <table className="min-w-full">
                  <thead className="bg-gray-50 dark:bg-[#282e39]">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#9da6b9]"
                      >
                        Transaction
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#9da6b9]"
                      >
                        Category
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#9da6b9]"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#9da6b9]"
                      >
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-[#3b4354]">
                    {topExpenses.map((expense) => (
                      <tr key={expense._id}>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          {expense.description || expense.vendor || "Expense"}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-[#9da6b9]">
                          {expense.category}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-[#9da6b9]">
                          {format(new Date(expense.date), "MMM dd, yyyy")}
                        </td>
                        <td
                          className={`whitespace-nowrap px-6 py-4 text-right text-sm font-medium ${
                            expense.type === "income"
                              ? "text-[#10B981]"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {expense.type === "income" ? "+" : "-"}₹
                          {expense.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {topExpenses.length === 0 && (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-6 py-8 text-center text-sm text-gray-500 dark:text-[#9da6b9]"
                        >
                          No transactions yet. Start by adding an expense.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Budget Goals */}
        <div className="flex flex-col gap-6">
          <h2 className="text-gray-900 dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">
            Budget Goals
          </h2>

          <div className="flex flex-col gap-6 rounded-xl bg-white dark:bg-[#1c1f27] p-6">
            {summary?.budgetGoals?.map((goal) => (
              <div key={goal.category} className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {goal.category}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-[#9da6b9]">
                    ₹{goal.spent.toLocaleString()}{" "}
                    <span className="text-gray-400 dark:text-[#7b88a1]">
                      / ₹{goal.limit.toLocaleString()}
                    </span>
                  </p>
                </div>
                <div className="w-full bg-gray-200 dark:bg-[#282e39] rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      goal.spent > goal.limit ? "bg-[#EF4444]" : "bg-primary"
                    }`}
                    style={{
                      width: `${Math.min(
                        (goal.spent / goal.limit) * 100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
                {goal.spent > goal.limit && (
                  <p className="text-xs text-[#EF4444] mt-1">
                    You've exceeded your budget by ₹
                    {(goal.spent - goal.limit).toLocaleString()}.
                  </p>
                )}
              </div>
            ))}
            {(!summary?.budgetGoals || summary.budgetGoals.length === 0) && (
              <p className="text-center text-sm text-gray-500 dark:text-[#9da6b9] py-4">
                No budget goals set. Set your first budget goal to track
                spending.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
