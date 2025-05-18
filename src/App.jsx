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
      <Route path="/login/oauth2/success" element={<AuthCallback />} />   {/* ✅ 성공 시 */}
      <Route path="/login/oauth2/failure" element={<LoginPage />} />      {/* ✅ 실패 시 */}
    </Routes>
  );
}

export default App;
