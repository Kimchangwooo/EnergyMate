import React from 'react';
import logoImage from './assets/EnergyMate_LoGo.png';

function LoginPage() {
  const loginWith = (provider) => {
    const backendBaseUrl = 'http://43.203.242.216'; // ← 실제 백엔드 배포 주소
    window.location.href = `${backendBaseUrl}/oauth2/authorize/${provider}`;
  };

  const LoginButton = ({ label, onClick, backgroundColor, color, icon }) => (
    <button style={{ ...styles.button, backgroundColor, color }} onClick={onClick}>
      <span style={styles.icon}>{icon}</span> {label}
    </button>
  );

  return (
    <div style={styles.container}>
      <div style={styles.logoWrapper}>
        <img src={logoImage} alt="EnergyMate" style={styles.logoMain} />
        <h1 style={styles.header}>EnergyMate</h1>
        <LoginButton
          label="카카오 로그인"
          onClick={() => loginWith('kakao')}
          backgroundColor="#fee500"
          color="black"
          icon="💬"
        />
        <LoginButton
          label="네이버 로그인"
          onClick={() => loginWith('naver')}
          backgroundColor="#1ec800"
          color="white"
          icon="N"
        />
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
  },
  logoWrapper: {
    position: 'relative',
    width: '300px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px',
  },
  logoMain: {
    width: '100%',
    borderRadius: '20px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
  },
  header: {
    marginTop: '15px',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#fff',
  },
  button: {
    padding: '12px 24px',
    fontSize: '1rem',
    borderRadius: '5px',
    width: '100%',
    maxWidth: '240px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: 'pointer',
  },
  icon: {
    marginRight: '8px',
  },
};

export default LoginPage;
