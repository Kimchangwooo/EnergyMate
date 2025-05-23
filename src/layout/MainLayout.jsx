import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

export default function MainLayout() {
  return (
    <div className="app-wrapper">
      <Sidebar />
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  )
}
