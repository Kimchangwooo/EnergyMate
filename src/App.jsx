import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage            from './pages/LoginPage.jsx'
import AuthCallback         from './pages/AuthCallback.jsx'
import MainLayout           from './layout/MainLayout.jsx'
import ElectricityAnalysis  from './pages/ElectricityAnalysis.jsx'
import RealTimeUsage        from './pages/RealTimeUsage.jsx'
import DataImputation       from './pages/DataImputation.jsx'

export default function App() {
  return (
    <Routes>
      {/* 로그인 관련 */}
      <Route path="/login"           element={<LoginPage />} />
      <Route path="/auth/callback"   element={<AuthCallback />} />

      {/* 보호된 루트: 로그인 후에만 진입 */}
      <Route path="/" element={<RequireAuth><MainLayout /></RequireAuth>}>
        <Route index         element={<ElectricityAnalysis />} />
        <Route path="usage"  element={<RealTimeUsage />} />
        <Route path="imputation" element={<DataImputation />} />
      </Route>

      {/* 위에 있는 어떤 경로에도 매칭되지 않으면 로그인으로 */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
