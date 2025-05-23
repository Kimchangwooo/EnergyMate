import React from 'react';
export default function ControlBox({ label, children }) {
  return (
    <div className="control-box">
      <div className="control-label">{label}</div>
      {children}
    </div>
  );
}
