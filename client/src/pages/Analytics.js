import React, { useState, useEffect } from 'react';
import { getSummary, getTrends, getPredictions } from '../services/api';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Analytics.css';

const COLORS = ['#667eea', '#764ba2', '#48bb78', '#ed8936', '#4299e1', '#f56565', '#38b2ac', '#9f7aea'];

const Analytics = () => {
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    try {
      const [summaryRes, trendsRes, predRes] = await Promise.all([
        getSummary({ period }),
        getTrends({ months: 6 }),
        getPredictions()
      ]);

      setSummary(summaryRes.data.summary);
      setTrends(trendsRes.data.trends);
      setPredictions(predRes.data.predictions);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading analytics...</div>;

  // Prepare data for charts
  const categoryData = summary?.byCategory
    ? Object.entries(summary.byCategory).map(([name, data]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: data.total
      }))
    : [];

  const trendData = trends?.monthly
    ? Object.entries(trends.monthly).map(([month, data]) => ({
        month: month.split('-')[1],
        total: data.total,
        count: data.count
      }))
    : [];

  const predictionData = predictions?.predictions?.byCategory
    ? Object.entries(predictions.predictions.byCategory).map(([name, data]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        predicted: data.predicted
      }))
    : [];

  return (
    <div className="analytics-page">
      <div className="page-header">
        <h1 className="page-title">Analytics & Insights</h1>
        <div className="period-selector">
          <button className={period === 'week' ? 'active' : ''} onClick={() => setPeriod('week')}>Week</button>
          <button className={period === 'month' ? 'active' : ''} onClick={() => setPeriod('month')}>Month</button>
          <button className={period === 'year' ? 'active' : ''} onClick={() => setPeriod('year')}>Year</button>
        </div>
      </div>

      <div className="grid grid-2">
        {/* Category Distribution */}
        <div className="card">
          <h2>📊 Category Distribution</h2>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="no-data">No data available</p>
          )}
        </div>

        {/* Spending Trend */}
        <div className="card">
          <h2>📈 Spending Trend (6 Months)</h2>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#667eea" strokeWidth={2} name="Total Spending" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="no-data">No trend data available</p>
          )}
        </div>
      </div>

      {/* Predictions */}
      {predictionData.length > 0 && (
        <div className="card">
          <h2>🔮 Next Month Predictions by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={predictionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="predicted" fill="#764ba2" name="Predicted Amount" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-4">
        <div className="metric-card">
          <div className="metric-icon">💰</div>
          <div className="metric-info">
            <h4>Total Spending</h4>
            <p>₹{summary?.total?.toLocaleString() || 0}</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">📝</div>
          <div className="metric-info">
            <h4>Transactions</h4>
            <p>{summary?.count || 0}</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">📊</div>
          <div className="metric-info">
            <h4>Average</h4>
            <p>₹{summary?.average?.toLocaleString() || 0}</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">📈</div>
          <div className="metric-info">
            <h4>Growth Rate</h4>
            <p className={trends?.growthRate >= 0 ? 'negative' : 'positive'}>
              {trends?.growthRate >= 0 ? '+' : ''}{trends?.growthRate?.toFixed(1) || 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
