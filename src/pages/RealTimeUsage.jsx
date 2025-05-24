// src/pages/RealTimeUsage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ControlBox     from '../components/ControlBox';
import ChartContainer from '../components/ChartContainer';
import FloorSelector  from '../components/FloorSelector';

export default function RealTimeUsage() {
  const [building,    setBuilding]   = useState('building1');
  const [date,        setDate]       = useState('2021-04-15');
  const [groupId,     setGroupId]    = useState(null);
  const [hourData,    setHourData]   = useState([]);
  const [floor,       setFloor]      = useState(1);
  const [floorData,   setFloorData]  = useState([]);

  // 공통 headers
  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
  });

  // 전체 시간대별 데이터 로드
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return window.location.href = '/login';

    axios.get(
      `http://3.36.111.107/api/building/name/${building}/daily`,
      { headers: getHeaders(), params: { date } }
    ).then(res => {
      const d = res.data.result;
      setHourData(
        Object.entries(d.hourlyData || {})
          .map(([hour, usage]) => ({ hour, usage: Math.floor(usage) }))
      );
      setGroupId(d.groupId);
    }).catch(console.error);
  }, [building, date]);

  // 선택된 층 데이터 로드
  useEffect(() => {
    if (!groupId) return;
    axios.get(
      `http://3.36.111.107/api/building/${groupId}/floor/${floor}/daily`,
      { headers: getHeaders(), params: { date } }
    ).then(res => {
      const d = res.data.result.hourlyData || {};
      setFloorData(
        Object.entries(d)
          .map(([hour, usage]) => ({ hour, usage: Math.floor(usage) }))
      );
    }).catch(console.error);
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
    controls: {
      display: 'flex',
      gap: '20px',
      flexWrap: 'wrap',
    },
    cardWrapper: {
      background: 'white',
      borderRadius: '20px',
      padding: '20px',
      flex: '1 1 280px',
    },
  };

  return (
    <div style={styles.grid}>
      {/* 1행: 컨트롤 박스만 */}
      <div style={styles.controls}>
        <div style={styles.cardWrapper}>
          <ControlBox label="건물 선택">
            <select
              value={building}
              onChange={e => setBuilding(e.target.value)}
            >
              {Array.from({ length: 10 }, (_, i) =>
                <option key={i} value={`building${i+1}`}>
                  {`building${i+1}`}
                </option>
              )}
            </select>
          </ControlBox>
        </div>
        <div style={styles.cardWrapper}>
          <ControlBox label="날짜 선택">
            <input
              type="date"
              min="2021-04-01"
              max="2021-06-30"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </ControlBox>
        </div>
      </div>

      {/* 2행: 전체 시간대별 사용량 차트 */}
      <ChartContainer
        title="시간별 전력 사용량 (kWh)"
        data={hourData}
      />

      {/* 3행: 층 선택 + 해당 층 차트 */}
      <div style={{ ...styles.controls, alignItems: 'center' }}>
        <FloorSelector selected={floor} onSelect={setFloor} />
      </div>
      <ChartContainer
        title={`시간별 사용량 (${floor}층, kWh)`}
        data={floorData}
      />
    </div>
  );
}
