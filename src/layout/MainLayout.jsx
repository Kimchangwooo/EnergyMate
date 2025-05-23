// layout/MainLayout.jsx
import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Sidebar from '../components/Sidebar';

export default function MainLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Outlet />
      </div>
    </div>
  );
}
