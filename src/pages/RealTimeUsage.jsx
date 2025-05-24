// src/pages/RealTimeUsage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ControlBox     from '../components/ControlBox';
import ChartContainer from '../components/ChartContainer';
import FloorSelector  from '../components/FloorSelector';

export default function RealTimeUsage() {
  const [building,  setBuilding]  = useState('building1');
  const [date,      setDate]      = useState('2021-04-15');
  const [groupId,   setGroupId]   = useState(null);
  const [hourData,  setHourData]  = useState([]);
  const [floor,     setFloor]     = useState(1);
  const [floorData, setFloorData] = useState([]);

  // 공통 헤더 생성 함수
  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
  });

  // 1) 전체 시간대별 사용량 불러오기
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return window.location.href = '/login';

    axios.get(
      `http://3.36.111.107/api/building/name/${building}/daily`,
      { headers: getHeaders(), params: { date } }
    )
    .then(res => {
      const d = res.data.result;
      setHourData(
        Object.entries(d.hourlyData || {})
          .map(([h, v]) => ({ hour: h, usage: Math.floor(v) }))
      );
      setGroupId(d.groupId);
    })
    .catch(console.error);
  }, [building, date]);

  // 2) 선택한 층 시간대별 사용량 불러오기
  useEffect(() => {
    if (!groupId) return;
    axios.get(
      `http://3.36.111.107/api/building/${groupId}/floor/${floor}/daily`,
      { headers: getHeaders(), params: { date } }
    )
    .then(res => {
      const d = res.data.result.hourlyData || {};
      setFloorData(
        Object.entries(d)
          .map(([h, v]) => ({ hour: h, usage: Math.floor(v) }))
      );
    })
    .catch(console.error);
  }, [groupId, date, floor]);

  // 인라인 스타일
  const styles = {
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '24px',
      padding: '24px',
      background: '#F4F7FE',
      minHeight: '100vh',
    },
    title: {
      margin: 0,
      color: '#2B3674',
      fontSize: '1.75rem',
      fontWeight: 'bold',
    },
    row: {
      display: 'flex',
      gap: '20px',
      flexWrap: 'wrap',
    },
    card: {
      background: 'white',
      borderRadius: '20px',
      padding: '20px',
      flex: '1 1 280px',
    },
    floorWrapper: {
      display: 'flex',
      justifyContent: 'flex-start',
      gap: '12px',
    },
  };

  return (
    <div style={styles.grid}>
      {/* 1행: 페이지 타이틀 */}
      <h2 style={styles.title}>실시간 사용량</h2>

      {/* 2행: 건물/날짜 선택 카드 */}
      <div style={styles.row}>
        <div style={styles.card}>
          <ControlBox label="건물 선택">
            <select
              value={building}
              onChange={e => setBuilding(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
            >
              {Array.from({ length: 10 }, (_, i) => (
                <option key={i} value={`building${i+1}`}>
                  {`building${i+1}`}
                </option>
              ))}
            </select>
          </ControlBox>
        </div>
        <div style={styles.card}>
          <ControlBox label="날짜 선택">
            <input
              type="date"
              min="2021-04-01"
              max="2021-06-30"
              value={date}
              onChange={e => setDate(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </ControlBox>
        </div>
      </div>

      {/* 3행: 전체 시간별 차트 */}
      <ChartContainer
        title="시간별 전력 사용량 (kWh)"
        data={hourData}
      />

      {/* 4행: 층 선택 버튼 */}
      <div style={styles.floorWrapper}>
        <FloorSelector selected={floor} onSelect={setFloor} />
      </div>

      {/* 5행: 층별 시간별 차트 */}
      <ChartContainer
        title={`시간별 사용량 (${floor}층, kWh)`}
        data={floorData}
      />
    </div>
  );
}
