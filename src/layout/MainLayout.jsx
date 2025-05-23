import React, { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import './MainLayout.css'             // ← CSS 임포트

export default function MainLayout() {
  const navigate = useNavigate()

  // 로그인 체크
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      navigate('/login', { replace: true })
    }
  }, [navigate])

  return (
    <div className="main-layout">
      <Sidebar />
      <div className="content-container">
        <Outlet />
      </div>
    </div>
  )
}
