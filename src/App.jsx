import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import AuthCallback from './pages/AuthCallback.jsx';
import MainLayout from './layout/MainLayout.jsx';
import ElectricityAnalysis from './pages/ElectricityAnalysis.jsx';
import RealTimeUsage from './pages/RealTimeUsage.jsx';
import DataImputation from './pages/DataImputation.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      <Route path="/" element={<MainLayout />}>
        <Route index element={<ElectricityAnalysis />} />
        <Route path="usage" element={<RealTimeUsage />} />
        <Route path="imputation" element={<DataImputation />} />
      </Route>
    </Routes>
  );
}
