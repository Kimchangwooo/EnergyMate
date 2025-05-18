import { Routes, Route } from 'react-router-dom';
import LoginPage from './loginPage.jsx';
import DashboardPage from './dashBoard.jsx';
import AuthCallback from './authCallback.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
    </Routes>
  );
}

export default App;
