import React, { useState, useEffect } from 'react';
import { getExpenses, createExpense, deleteExpense, scanReceipt } from '../services/api';
import { format } from 'date-fns';
import './Expenses.css';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    amount: '',
    category: 'other',
    description: '',
    vendor: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [receiptFile, setReceiptFile] = useState(null);
  const [scanning, setScanning] = useState(false);

  const categories = ['food', 'transport', 'utilities', 'rent', 'entertainment', 'healthcare', 
    'shopping', 'education', 'travel', 'personal', 'celebration', 'emergency', 'other'];

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await getExpenses();
      setExpenses(res.data.expenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createExpense(formData);
      setShowModal(false);
      setFormData({ amount: '', category: 'other', description: '', vendor: '', date: new Date().toISOString().split('T')[0] });
      fetchExpenses();
    } catch (error) {
      console.error('Error creating expense:', error);
      alert('Failed to add expense');
    }
  };

  const handleScanReceipt = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setScanning(true);
    const formData = new FormData();
    formData.append('receipt', file);

    try {
      const res = await scanReceipt(formData);
      alert(`Receipt scanned! Amount: ₹${res.data.expense.amount}, Category: ${res.data.expense.category}`);
      fetchExpenses();
    } catch (error) {
      console.error('Error scanning receipt:', error);
      alert('Failed to scan receipt');
    } finally {
      setScanning(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(id);
        fetchExpenses();
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  if (loading) return <div className="loading">Loading expenses...</div>;

  return (
    <div className="expenses-page">
      <div className="page-header">
        <h1 className="page-title">Expenses</h1>
        <div className="header-actions">
          <label className="btn btn-secondary">
            {scanning ? '📷 Scanning...' : '📷 Scan Receipt'}
            <input type="file" accept="image/*" onChange={handleScanReceipt} style={{ display: 'none' }} disabled={scanning} />
          </label>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            ➕ Add Expense
          </button>
        </div>
      </div>

      <div className="card">
        {expenses.length > 0 ? (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense._id}>
                    <td>{format(new Date(expense.date), 'MMM dd, yyyy')}</td>
                    <td>{expense.description || expense.vendor || 'Expense'}</td>
                    <td><span className={`category-badge ${expense.category}`}>{expense.category}</span></td>
                    <td className="amount">₹{expense.amount.toLocaleString()}</td>
                    <td>
                      <button className="btn-icon" onClick={() => handleDelete(expense._id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-data">No expenses yet. Add your first expense!</p>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Expense</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Amount (₹)</label>
                <input type="number" className="form-control" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select className="form-control" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <input type="text" className="form-control" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Vendor</label>
                <input type="text" className="form-control" value={formData.vendor} onChange={(e) => setFormData({ ...formData, vendor: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input type="date" className="form-control" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
              </div>
              <button type="submit" className="btn btn-primary btn-block">Add Expense</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
