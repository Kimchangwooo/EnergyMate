// src/layout/MainLayout.jsx
import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Sidebar from '../components/Sidebar';

export default function MainLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('accessToken')) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',      // 뷰포트 전체 높이
        overflow: 'hidden',   // 전체적으로 가로 스크롤 방지
      }}
    >
      <Sidebar />

      {/* 오른쪽 컨텐츠 */}
      <div
        style={{
          flex: 1,
          minWidth: 0,        // flex 자식이 넘어가지 않도록
          background: '#F4F7FE',
          overflowY: 'auto',  // 세로 스크롤만
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}
