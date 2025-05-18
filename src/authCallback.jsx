import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function AuthCallback() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const accessToken = queryParams.get('token');
    const refreshToken = queryParams.get('refreshToken');

    if (accessToken && refreshToken) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      navigate('/'); // 대시보드로 이동
    } else {
      navigate('/login', { state: { error: '로그인 실패' } });
    }
  }, [location, navigate]);

  return <p>로그인 처리 중입니다...</p>;
}

export default AuthCallback;
