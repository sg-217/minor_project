import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import {
  getExpenses,
  createExpense,
  deleteExpense,
  scanReceipt,
} from "../services/api";
import { format } from "date-fns";
import { AuthContext } from "../context/AuthContext";

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    amount: "",
    category: "other",
    description: "",
    vendor: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [scanning, setScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { user } = useContext(AuthContext);

  const categories = [
    {
      name: "Food & Dining",
      value: "food",
      color: "bg-orange-500",
      amount: 580.2,
    },
    {
      name: "Transportation",
      value: "transport",
      color: "bg-teal-500",
      amount: 125.5,
    },
    {
      name: "Entertainment",
      value: "entertainment",
      color: "bg-purple-500",
      amount: 78.0,
    },
    {
      name: "Shopping",
      value: "shopping",
      color: "bg-red-500",
      amount: 210.99,
    },
    {
      name: "Groceries",
      value: "groceries",
      color: "bg-green-500",
      amount: 350.4,
    },
  ];

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await getExpenses();
      setExpenses(res.data.expenses);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createExpense(formData);
      setShowModal(false);
      setFormData({
        amount: "",
        category: "other",
        description: "",
        vendor: "",
        date: new Date().toISOString().split("T")[0],
      });
      fetchExpenses();
    } catch (error) {
      console.error("Error creating expense:", error);
      alert("Failed to add expense");
    }
  };

  const handleScanReceipt = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setScanning(true);
    const formData = new FormData();
    formData.append("receipt", file);

    try {
      const res = await scanReceipt(formData);
      alert(
        `Receipt scanned! Amount: ₹${res.data.expense.amount}, Category: ${res.data.expense.category}`
      );
      fetchExpenses();
    } catch (error) {
      console.error("Error scanning receipt:", error);
      alert("Failed to scan receipt");
    } finally {
      setScanning(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await deleteExpense(id);
        fetchExpenses();
      } catch (error) {
        console.error("Error deleting expense:", error);
      }
    }
  };

  const groupExpensesByDate = (expenses) => {
    const grouped = {};
    expenses.forEach((expense) => {
      const date = format(new Date(expense.date), "MMM dd");
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(expense);
    });
    return grouped;
  };

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      searchQuery === "" ||
      expense.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.vendor?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory || expense.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedExpenses = groupExpensesByDate(filteredExpenses);
  const totalExpenses = filteredExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-gray-900 dark:text-white text-lg">
          Loading expenses...
        </div>
      </div>
    );
  }

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
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary dark:bg-primary/20"
            >
              <span className="material-symbols-outlined">receipt_long</span>
              <p className="text-sm font-medium leading-normal">Expenses</p>
            </Link>
            <Link
              to="/goals"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <span className="material-symbols-outlined">pie_chart</span>
              <p className="text-sm font-medium leading-normal">Budgets</p>
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
          {/* PageHeading & ToolBar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
            <p className="text-4xl font-black leading-tight tracking-[-0.033em] text-gray-900 dark:text-white">
              Expenses
            </p>
            <div className="flex items-center gap-2">
              <button
                className="flex h-10 items-center justify-center rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111318] p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => alert("Voice input feature coming soon!")}
              >
                <span className="material-symbols-outlined text-xl">mic</span>
              </button>
              <label className="flex h-10 items-center justify-center rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111318] p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                <span className="material-symbols-outlined text-xl">
                  qr_code_scanner
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleScanReceipt}
                  className="hidden"
                  disabled={scanning}
                />
              </label>
              <button
                onClick={() => setShowModal(true)}
                className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary/90"
              >
                <span className="material-symbols-outlined text-xl">add</span>
                <span>Add Expense</span>
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left Column: Filters & Calendar */}
            <div className="lg:col-span-4 xl:col-span-3">
              <div className="space-y-6">
                {/* SearchBar */}
                <div>
                  <label className="flex flex-col min-w-40 h-12 w-full">
                    <div className="flex w-full flex-1 items-stretch rounded-lg h-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#282e39]">
                      <div className="text-gray-400 dark:text-[#9da6b9] flex items-center justify-center pl-4">
                        <span className="material-symbols-outlined">
                          search
                        </span>
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden text-gray-900 dark:text-white focus:outline-0 focus:ring-0 border-none bg-transparent h-full placeholder:text-gray-400 dark:placeholder:text-[#9da6b9] px-2 text-sm font-normal leading-normal"
                        placeholder="Search expenses..."
                      />
                    </div>
                  </label>
                </div>

                {/* Category Filter */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111318] p-4">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Categories
                  </h3>
                  <div className="mt-4 space-y-3">
                    {categories.map((category) => (
                      <button
                        key={category.value}
                        onClick={() =>
                          setSelectedCategory(
                            selectedCategory === category.value
                              ? null
                              : category.value
                          )
                        }
                        className={`flex w-full items-center justify-between text-sm font-medium ${
                          selectedCategory === category.value
                            ? "text-primary"
                            : "text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={`block size-2.5 rounded-full ${category.color}`}
                          ></span>
                          {category.name}
                        </span>
                        <span>₹{category.amount.toFixed(2)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Expenses List */}
            <div className="lg:col-span-8 xl:col-span-9">
              <div className="space-y-6">
                {/* Summary Card */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111318] p-5">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Expenses for {format(new Date(), "MMMM")}
                  </p>
                  <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                    ₹{totalExpenses.toLocaleString()}
                  </p>
                </div>

                {/* Expenses List */}
                <div className="space-y-6">
                  {Object.entries(groupedExpenses).map(
                    ([date, dayExpenses]) => (
                      <div key={date}>
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                          {date}
                        </h3>
                        <div className="mt-3 flow-root">
                          <div className="-my-3 divide-y divide-gray-200 dark:divide-gray-800">
                            {dayExpenses.map((expense) => (
                              <div
                                key={expense._id}
                                className="flex items-center justify-between py-3"
                              >
                                <div className="flex items-center gap-3">
                                  <span
                                    className={`block size-2.5 shrink-0 rounded-full ${
                                      categories.find(
                                        (c) => c.value === expense.category
                                      )?.color || "bg-gray-500"
                                    }`}
                                  ></span>
                                  <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                      {expense.description ||
                                        expense.vendor ||
                                        "Expense"}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {expense.category}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    -₹{expense.amount.toLocaleString()}
                                  </p>
                                  <button
                                    onClick={() => handleDelete(expense._id)}
                                    className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                                  >
                                    <span className="material-symbols-outlined text-sm">
                                      delete
                                    </span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  )}
                  {filteredExpenses.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">
                        No expenses found
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Expense</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Amount (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  className="form-control"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Vendor</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.vendor}
                  onChange={(e) =>
                    setFormData({ ...formData, vendor: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-block">
                Add Expense
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
