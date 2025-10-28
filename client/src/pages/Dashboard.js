import React, { useState, useEffect } from 'react';
import { getSummary, getTopExpenses, getComparison, getPredictions } from '../services/api';
import { format } from 'date-fns';
import './Dashboard.css';

const Dashboard = () => {
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
        getSummary({ period: 'month' }),
        getTopExpenses({ limit: 5, period: 'month' }),
        getComparison(),
        getPredictions()
      ]);

      setSummary(summaryRes.data.summary);
      setTopExpenses(topRes.data.topExpenses);
      setComparison(compRes.data.comparison);
      setPredictions(predRes.data.predictions);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-3">
        <div className="stat-card">
          <h3>This Month's Spending</h3>
          <div className="value">₹{summary?.total?.toLocaleString() || 0}</div>
          <div className={`change ${comparison?.percentChange >= 0 ? 'negative' : 'positive'}`}>
            {comparison?.percentChange >= 0 ? '↑' : '↓'} {Math.abs(comparison?.percentChange || 0).toFixed(1)}% from last month
          </div>
        </div>

        <div className="stat-card">
          <h3>Total Transactions</h3>
          <div className="value">{summary?.count || 0}</div>
          <div className="change">
            {summary?.count > comparison?.previous?.count ? '↑' : '↓'} {Math.abs((summary?.count || 0) - (comparison?.previous?.count || 0))} from last month
          </div>
        </div>

        <div className="stat-card">
          <h3>Average Transaction</h3>
          <div className="value">₹{summary?.average?.toLocaleString() || 0}</div>
          <div className="change">Per transaction</div>
        </div>
      </div>

      {/* Predictions */}
      {predictions && predictions.predictions && (
        <div className="card">
          <h2>📊 Next Month Predictions</h2>
          <div className="predictions-container">
            <div className="prediction-stat">
              <h4>Predicted Total</h4>
              <p className="prediction-value">₹{predictions.predictions.total?.toLocaleString()}</p>
              <span className={`confidence-badge ${predictions.confidence}`}>
                {predictions.confidence} confidence
              </span>
            </div>

            {predictions.insights && predictions.insights.length > 0 && (
              <div className="insights">
                <h4>💡 Insights</h4>
                {predictions.insights.map((insight, idx) => (
                  <div key={idx} className={`insight-item ${insight.type}`}>
                    {insight.message}
                  </div>
                ))}
              </div>
            )}

            {predictions.predictions.irregular && Object.keys(predictions.predictions.irregular).length > 0 && (
              <div className="irregular-predictions">
                <h4>⚠️ Irregular Expenses Alert</h4>
                {Object.entries(predictions.predictions.irregular).map(([category, data]) => (
                  <div key={category} className="irregular-item">
                    <span className={`category-badge ${category}`}>{category}</span>
                    <div className="irregular-info">
                      <span>Probability: {(data.probability * 100).toFixed(0)}%</span>
                      <span className="amount">₹{data.predictedAmount?.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-2">
        {/* Top Expenses */}
        <div className="card">
          <h2>🔝 Top Expenses This Month</h2>
          {topExpenses.length > 0 ? (
            <div className="expense-list">
              {topExpenses.map((expense) => (
                <div key={expense._id} className="expense-item">
                  <div className="expense-info">
                    <h4>{expense.description || expense.vendor || 'Expense'}</h4>
                    <p>
                      <span className={`category-badge ${expense.category}`}>
                        {expense.category}
                      </span>
                      <span className="expense-date">
                        {format(new Date(expense.date), 'MMM dd, yyyy')}
                      </span>
                    </p>
                  </div>
                  <div className="expense-amount">
                    ₹{expense.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No expenses yet. Start adding expenses!</p>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="card">
          <h2>📂 Category Breakdown</h2>
          {summary?.byCategory && Object.keys(summary.byCategory).length > 0 ? (
            <div className="category-breakdown">
              {Object.entries(summary.byCategory)
                .sort((a, b) => b[1].total - a[1].total)
                .slice(0, 6)
                .map(([category, data]) => (
                  <div key={category} className="category-item">
                    <div className="category-header">
                      <span className={`category-badge ${category}`}>{category}</span>
                      <span className="category-amount">₹{data.total.toLocaleString()}</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${(data.total / summary.total) * 100}%` }}
                      ></div>
                    </div>
                    <div className="category-stats">
                      <span>{data.count} transactions</span>
                      <span>{((data.total / summary.total) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="no-data">No category data available</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2>🚀 Quick Actions</h2>
        <div className="quick-actions">
          <button className="action-btn" onClick={() => window.location.href = '/expenses'}>
            ➕ Add Expense
          </button>
          <button className="action-btn" onClick={() => window.location.href = '/goals'}>
            🎯 Set Goal
          </button>
          <button className="action-btn" onClick={() => window.location.href = '/analytics'}>
            📈 View Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
