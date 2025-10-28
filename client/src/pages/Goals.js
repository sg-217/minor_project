import React, { useState, useEffect } from 'react';
import { getGoals, createGoal, contributeToGoal, deleteGoal, getGoalRecommendations } from '../services/api';
import { format } from 'date-fns';
import './Goals.css';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [selectedGoalRec, setSelectedGoalRec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    targetAmount: '',
    deadline: '',
    category: 'other',
    priority: 'medium'
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const res = await getGoals();
      setGoals(res.data.goals);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createGoal(formData);
      setShowModal(false);
      setFormData({ title: '', targetAmount: '', deadline: '', category: 'other', priority: 'medium' });
      fetchGoals();
    } catch (error) {
      console.error('Error creating goal:', error);
      alert('Failed to create goal');
    }
  };

  const handleViewRecommendations = async (goalId) => {
    try {
      const res = await getGoalRecommendations(goalId);
      setSelectedGoalRec(res.data.recommendations);
      setShowRecommendations(true);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await deleteGoal(id);
        fetchGoals();
      } catch (error) {
        console.error('Error deleting goal:', error);
      }
    }
  };

  if (loading) return <div className="loading">Loading goals...</div>;

  return (
    <div className="goals-page">
      <div className="page-header">
        <h1 className="page-title">Financial Goals</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          🎯 Set New Goal
        </button>
      </div>

      <div className="grid grid-2">
        {goals.length > 0 ? (
          goals.map((goal) => (
            <div key={goal._id} className="card goal-card">
              <div className="goal-header">
                <h3>{goal.title}</h3>
                <span className={`priority-badge ${goal.priority}`}>{goal.priority}</span>
              </div>
              <div className="goal-info">
                <div className="goal-amounts">
                  <div>
                    <label>Current</label>
                    <p>₹{goal.currentAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <label>Target</label>
                    <p>₹{goal.targetAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <label>Remaining</label>
                    <p>₹{goal.remainingAmount.toLocaleString()}</p>
                  </div>
                </div>
                <div className="goal-progress">
                  <div className="progress-header">
                    <span>{goal.progress.toFixed(1)}% Complete</span>
                    <span>{goal.daysRemaining} days left</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${Math.min(goal.progress, 100)}%` }}></div>
                  </div>
                </div>
                <div className="goal-footer">
                  <p>💡 Suggested: ₹{goal.monthlyContribution.toLocaleString()}/month</p>
                  <p>📅 Deadline: {format(new Date(goal.deadline), 'MMM dd, yyyy')}</p>
                </div>
              </div>
              <div className="goal-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => handleViewRecommendations(goal._id)}>
                  📊 View Plan
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(goal._id)}>
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="card">
            <p className="no-data">No goals yet. Set your first financial goal!</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Set Financial Goal</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Goal Title</label>
                <input type="text" className="form-control" placeholder="e.g., Buy a laptop" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Target Amount (₹)</label>
                <input type="number" className="form-control" value={formData.targetAmount} onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Deadline</label>
                <input type="date" className="form-control" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select className="form-control" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary btn-block">Create Goal</button>
            </form>
          </div>
        </div>
      )}

      {showRecommendations && selectedGoalRec && (
        <div className="modal-overlay" onClick={() => setShowRecommendations(false)}>
          <div className="modal-content recommendations-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>💡 Budget Recommendations</h2>
              <button className="close-btn" onClick={() => setShowRecommendations(false)}>×</button>
            </div>
            <div className="recommendations-content">
              <div className="rec-summary">
                <div className="rec-item">
                  <label>Required Monthly Savings</label>
                  <p className="rec-value">₹{selectedGoalRec.requiredMonthlySavings?.toLocaleString()}</p>
                </div>
                <div className="rec-item">
                  <label>Current Monthly Spending</label>
                  <p className="rec-value">₹{selectedGoalRec.currentMonthlySpending?.toLocaleString()}</p>
                </div>
                <div className="rec-item">
                  <label>Target Monthly Spending</label>
                  <p className="rec-value target">₹{selectedGoalRec.targetMonthlySpending?.toLocaleString()}</p>
                </div>
              </div>
              {selectedGoalRec.categoryReductions && selectedGoalRec.categoryReductions.length > 0 && (
                <div className="category-reductions">
                  <h3>Suggested Reductions</h3>
                  {selectedGoalRec.categoryReductions.map((item, idx) => (
                    <div key={idx} className="reduction-item">
                      <span className={`category-badge ${item.category}`}>{item.category}</span>
                      <div className="reduction-info">
                        <span>Current: ₹{item.currentSpending.toLocaleString()}</span>
                        <span className="reduction">-₹{item.suggestedReduction.toLocaleString()}</span>
                        <span className="new-budget">New: ₹{item.newBudget.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {selectedGoalRec.insights && selectedGoalRec.insights.length > 0 && (
                <div className="insights">
                  {selectedGoalRec.insights.map((insight, idx) => (
                    <div key={idx} className={`insight-item ${insight.type}`}>
                      {insight.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
