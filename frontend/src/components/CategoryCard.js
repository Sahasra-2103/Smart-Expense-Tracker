import React from 'react';
import './CategoryCard.css';

const CATEGORY_ICONS = {
  Food: '🍔',
  Shopping: '🛍️',
  Travel: '✈️',
  Bills: '📄',
  Entertainment: '🎬',
  Health: '🏥',
  Education: '📚',
  Other: '📌',
};

export default function CategoryCard({ category, amount, count }) {
  const icon = CATEGORY_ICONS[category] || '📌';

  return (
    <div className="category-card">
      <div className="category-icon">{icon}</div>
      <div className="category-content">
        <h3 className="category-name">{category}</h3>
        <p className="category-count">{count} transaction{count !== 1 ? 's' : ''}</p>
      </div>
      <div className="category-amount">
        ₹{(amount || 0).toFixed(2)}
      </div>
    </div>
  );
}
