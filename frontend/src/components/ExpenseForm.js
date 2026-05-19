import React, { useState } from 'react';
import api from '../services/api';
import './ExpenseForm.css';

export default function ExpenseForm({ onExpenseAdded }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleFileChange = (e) => {
    const f = e.target.files[0] || null;
    setFile(f);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!file) {
      setError('Please select a receipt image to upload');
      return;
    }

    const data = new FormData();
    data.append('file', file);

    setLoading(true);
    try {
      await api.post('/expenses/upload', data);
      setSuccess('Receipt processed — dashboard updated.');
      setFile(null);
      if (onExpenseAdded) onExpenseAdded();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="expense-form-container">
      <div className="expense-form-card">
        <h2>Upload Receipt</h2>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="expense-form" encType="multipart/form-data">
          <div className="form-group">
            <label htmlFor="file">Receipt Image</label>
            <input
              type="file"
              id="file"
              name="file"
              accept="image/png,image/jpeg,image/jpg,application/pdf"
              onChange={handleFileChange}
            />
            {file && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#333' }}>
                Selected file: {file.name}
              </div>
            )}
            <small>Only upload the receipt image — the app will extract amounts and categories automatically.</small>
          </div>

          <button type="submit" disabled={loading || !file} className="btn-submit">
            {loading ? 'Processing...' : 'Upload Receipt'}
          </button>
        </form>
      </div>
    </div>
  );
}
