// src/pages/ElectricityAnalysis.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function ElectricityAnalysis() {
  const [building,  setBuilding]  = useState('building1');
  const [date,      setDate]      = useState('2021-04-15');
  const [todayBill, setTodayBill] = useState(null);
  const [predMay,   setPredMay]   = useState(null);
  const [predJun,   setPredJun]   = useState(null);

  // 로그인 체크 (마운트 시)
  useEffect(() => {
    if (!localStorage.getItem('accessToken')) {
      window.location.href = '/login';
    }
  }, []);

  const fetchData = async () => {
    console.log('fetchData 호출!'); // 디버깅용 로그
    const token = localStorage.getItem('accessToken');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };

    try {
      // 1) 당일 전기세 + groupId 조회
      const { data: dailyData } = await axios.get(
        `http://3.36.111.107/api/building/name/${building}/daily`,
        { headers, params: { date } }
      );
      const d = dailyData.result;
      if (!d) return;

      setTodayBill(Math.floor(d.totalPower));

      // 2) 5월·6월 예측 전기세 (한꺼번에)
      const gid = d.groupId;
      const [mayRes, junRes] = await Promise.all([
        axios.get(`http://3.36.111.107/api/building/${gid}/2021-05/prediction`, { headers }),
        axios.get(`http://3.36.111.107/api/building/${gid}/2021-06/prediction`, { headers }),
      ]);

      setPredMay(Math.floor(mayRes.data.result?.predictedValue));
      setPredJun(Math.floor(junRes.data.result?.predictedValue));
    } catch (err) {
      console.error(err);
    }
  };

  // 인라인 스타일 정의
  const styles = {
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '20px',
      padding: '20px',
      background: '#F4F7FE',
      minHeight: '100vh',
    },
    header: {
      gridColumn: '1 / -1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    fetchButton: {
      padding: '8px 16px',
      fontSize: '1rem',
      borderRadius: '6px',
      border: '2px solid #2B3674',
      backgroundColor: '#2B3674',
      color: 'white',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '20px',
      padding: '20px',
    },
    controlLabel: {
      color: '#A3AED0',
      fontSize: '0.9rem',
      marginBottom: '8px',
      display: 'block',
    },
    select: {
      width: '100%',
      padding: '10px',
      borderRadius: '8px',
      border: '1px solid #ccc',
      fontSize: '1rem',
    },
    inputDate: {
      width: '100%',
      padding: '10px',
      borderRadius: '8px',
      border: '1px solid #ccc',
      fontSize: '1rem',
    },
    statTitle: {
      color: '#A3AED0',
      fontSize: '0.9rem',
      marginBottom: '8px',
    },
    statValue: {
      color: '#2B3674',
      fontSize: '1.5rem',
      fontWeight: 'bold',
    },
  };

  return (
    <div style={styles.grid}>
      {/* 1행: 타이틀 + 버튼 */}
      <div style={styles.header}>
        <h2 style={{ margin: 0, color: '#2B3674' }}>전기세 분석</h2>
        <button style={styles.fetchButton} onClick={fetchData}>
          데이터 요청하기
        </button>
      </div>

      {/* 2행: 건물 선택 */}
      <div style={styles.card}>
        <label style={styles.controlLabel}>건물 선택</label>
        <select
          style={styles.select}
          value={building}
          onChange={e => setBuilding(e.target.value)}
        >
          {Array.from({ length: 10 }, (_, i) => (
            <option key={i} value={`building${i+1}`}>
              {`building${i+1}`}
            </option>
          ))}
        </select>
      </div>

      {/* 2행: 날짜 선택 */}
      <div style={styles.card}>
        <label style={styles.controlLabel}>날짜 선택</label>
        <input
          type="date"
          min="2021-04-12"
          max="2021-06-30"
          value={date}
          onChange={e => setDate(e.target.value)}
          style={styles.inputDate}
        />
      </div>

      {/* 2행: 당일 전기세 */}
      <div style={styles.card}>
        <div style={styles.statTitle}>당일 전기세</div>
        <div style={styles.statValue}>
          {todayBill !== null ? `${todayBill.toLocaleString()}원` : '-'}
        </div>
      </div>

      {/* 3행: 5월 예측 전기세 */}
      <div style={styles.card}>
        <div style={styles.statTitle}>예측 전기세 (05월)</div>
        <div style={styles.statValue}>
          {predMay !== null ? `₩ ${predMay.toLocaleString()}` : '-'}
        </div>
      </div>

      {/* 3행: 6월 예측 전기세 */}
      <div style={styles.card}>
        <div style={styles.statTitle}>예측 전기세 (06월)</div>
        <div style={styles.statValue}>
          {predJun !== null ? `₩ ${predJun.toLocaleString()}` : '-'}
        </div>
      </div>
    </div>
  );
}
