import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ExpenseForm from '../components/ExpenseForm';
import CategoryCard from '../components/CategoryCard';
import './Dashboard.css';

export default function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState({});
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [editingValues, setEditingValues] = useState({});
  const expenseCategories = ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'];

  useEffect(() => {
    fetchExpenses();
  }, [refresh]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      // Get all expenses
      const expensesRes = await api.get('/expenses');
      const items = expensesRes.data.items || [];
      setExpenses(items);

      // Calculate by category
      const categoryData = {};
      let total = 0;

      items.forEach((expense) => {
        if (!categoryData[expense.category]) {
          categoryData[expense.category] = { amount: 0, count: 0 };
        }
        categoryData[expense.category].amount += expense.amount;
        categoryData[expense.category].count += 1;
        total += expense.amount;
      });

      setCategories(categoryData);
      setTotalAmount(total);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load expenses');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExpenseAdded = () => {
    setRefresh((prev) => prev + 1);
  };

  const startEdit = (expense) => {
    setEditingExpenseId(expense._id);
    setEditingValues({
      title: expense.title || '',
      amount: expense.amount?.toString() || '0',
      category: expense.category || 'Other',
      description: expense.description || '',
      expenseDate: new Date(expense.expenseDate).toISOString().split('T')[0],
    });
  };

  const cancelEdit = () => {
    setEditingExpenseId(null);
    setEditingValues({});
  };

  const handleEditChange = (field, value) => {
    setEditingValues((prev) => ({ ...prev, [field]: value }));
  };

  const saveEdit = async (expenseId) => {
    try {
      await api.put(`/expenses/${expenseId}`, {
        ...editingValues,
        amount: Number(editingValues.amount),
        expenseDate: editingValues.expenseDate,
      });
      setEditingExpenseId(null);
      setEditingValues({});
      setRefresh((prev) => prev + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update expense');
    }
  };

  const deleteExpense = async (expenseId) => {
    try {
      await api.delete(`/expenses/${expenseId}`);
      setRefresh((prev) => prev + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete expense');
    }
  };

  return (
    <div className="dashboard">
      <ExpenseForm onExpenseAdded={handleExpenseAdded} />

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h2>Expense Summary</h2>
          <div className="total-amount">
            Total: <span>₹{totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="loading">Loading expenses...</div>
        ) : Object.keys(categories).length > 0 ? (
          <div className="categories-grid">
            {Object.entries(categories)
              .sort((a, b) => b[1].amount - a[1].amount)
              .map(([category, data]) => (
                <CategoryCard
                  key={category}
                  category={category}
                  amount={data.amount}
                  count={data.count}
                />
              ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No expenses yet. Add your first expense above!</p>
          </div>
        )}

        {expenses.length > 0 && (
          <div className="expenses-list-section">
            <h3>All Expenses</h3>
            <div className="expenses-list">
              {expenses
                .sort((a, b) => new Date(b.expenseDate) - new Date(a.expenseDate))
                .slice(0, 10)
                .map((expense) => (
                  <div key={expense._id} className="expense-item">
                    {editingExpenseId === expense._id ? (
                      <div className="expense-edit-form">
                        <input
                          type="text"
                          value={editingValues.title}
                          onChange={(e) => handleEditChange('title', e.target.value)}
                          placeholder="Title"
                          className="edit-input"
                        />
                        <input
                          type="number"
                          value={editingValues.amount}
                          onChange={(e) => handleEditChange('amount', e.target.value)}
                          placeholder="Amount"
                          className="edit-input"
                        />
                        <select
                          value={editingValues.category}
                          onChange={(e) => handleEditChange('category', e.target.value)}
                          className="edit-input"
                        >
                          {expenseCategories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <input
                          type="date"
                          value={editingValues.expenseDate}
                          onChange={(e) => handleEditChange('expenseDate', e.target.value)}
                          className="edit-input"
                        />
                        <input
                          type="text"
                          value={editingValues.description}
                          onChange={(e) => handleEditChange('description', e.target.value)}
                          placeholder="Description"
                          className="edit-input"
                        />
                        <div className="expense-edit-actions">
                          <button className="btn-save" onClick={() => saveEdit(expense._id)}>
                            Save
                          </button>
                          <button className="btn-cancel" onClick={cancelEdit}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="expense-info">
                          <p className="expense-category">{expense.category}</p>
                          <p className="expense-description">{expense.description || expense.title || 'No description'}</p>
                          <p className="expense-date">
                            {new Date(expense.expenseDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="expense-amount">₹{expense.amount.toFixed(2)}</div>
                        <div className="expense-actions">
                          <button className="btn-edit" onClick={() => startEdit(expense)}>
                            Edit
                          </button>
                          <button className="btn-delete" onClick={() => deleteExpense(expense._id)}>
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
