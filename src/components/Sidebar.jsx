import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h1 className="sidebar-logo">EnergyMate</h1>
      <nav>
        <NavLink to="/" end>전기세 분석</NavLink>
        <NavLink to="/usage">실시간 사용량</NavLink>
        <NavLink to="/imputation">결측치 보정</NavLink>
      </nav>
      <button className="logout">Logout</button>
    </aside>
  );
}
