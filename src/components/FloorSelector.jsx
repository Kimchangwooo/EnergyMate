import React from 'react';
export default function FloorSelector({ selected, onSelect }) {
  return (
    <div className="floor-selector">
      {[1,2,3,4,5,6].map(f => (
        <button key={f}
          className={selected===f?'active':''}
          onClick={()=>onSelect(f)}
        >{f}층</button>
      ))}
    </div>
  );
}
