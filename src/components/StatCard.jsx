import React from 'react';
export default function StatCard({ title, value, width }) {
  return (
    <div className="stat-card" style={{ width }}>
      <div className="stat-title">{title}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}
