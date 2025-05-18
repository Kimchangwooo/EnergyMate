import React, { useEffect, useState } from 'react';
import axios from 'axios';

function DashboardPage() {
  const [buildingCount, setBuildingCount] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [predictedBill, setPredictedBill] = useState(0);
  const [totalBill, setTotalBill] = useState(0);
  const [roomStats, setRoomStats] = useState([]);
  const [pieData, setPieData] = useState({ lighting: 0, aircon: 0 });
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };
  
    const buildingName = 'BuildingA'; // 서버에 등록된 정확한 빌딩 이름
    const date = '2021-04-15';
  
    // ✅ 건물 수 조회
    axios
      .get('http://3.36.111.107/api/building/count', { headers })
      .then((res) => {
        setBuildingCount(res.data.result || 0);
      })
      .catch((err) => {
        console.error('건물 수 조회 실패:', err);
      });
  
    // ✅ 빌딩 이름 기반 일일 전력 사용량 조회 (방어 코드 포함)
    axios
      .get(`http://3.36.111.107/api/building/name/${buildingName}/daily`, {
        headers,
        params: { date },
      })
      .then((res) => {
        console.log('빌딩 응답 데이터:', res.data); // 🔍 디버깅용
  
        const data = res.data?.result;
        if (!data) {
          console.warn('⚠️ result가 없습니다. buildingName/date 확인 필요');
          return;
        }
  
        setTotalBill(data.totalPower || 0);
        setPieData({
          lighting: data.hourlyData?.additionalProp1 || 0,
          aircon: data.hourlyData?.additionalProp2 || 0,
        });
        setRoomStats([
          {
            name: `Group ${data.groupId}`,
            usage: data.totalPower || 0,
            cost: Math.round((data.totalPower || 0) * 120),
          },
        ]);
      })
      .catch((err) => {
        console.error('빌딩 데이터 조회 실패:', err);
      });
  }, []);
  

  return (
    <div style={{ background: '#F4F7FE', minHeight: '100vh', padding: '32px' }}>
      <h2 style={{ color: '#2B3674' }}>대시보드</h2>

      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <Card title="건물 수" value={buildingCount} />
        <Card title="예상 전기세" value={`₩ ${predictedBill.toLocaleString()}`} />
        <Card title="Active users" value={activeUsers} />
      </div>

      <div style={{ display: 'flex', marginTop: '20px', gap: '20px' }}>
        <PieChart lighting={pieData.lighting} aircon={pieData.aircon} />
        <LineChart totalBill={totalBill} />
      </div>

      <div
        style={{
          background: 'white',
          borderRadius: '20px',
          marginTop: '40px',
          padding: '20px',
        }}
      >
        <h3 style={{ color: '#1B2559' }}>그룹별 통계</h3>
        {roomStats.map((room, i) => (
          <RoomRow key={i} room={room} />
        ))}
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div style={{ background: 'white', borderRadius: '20px', padding: '20px', width: '300px' }}>
      <div style={{ color: '#A3AED0', fontSize: '14px' }}>{title}</div>
      <div style={{ color: '#2B3674', fontSize: '24px', fontWeight: 'bold' }}>{value}</div>
    </div>
  );
}

function PieChart({ lighting, aircon }) {
  return (
    <div style={{ background: 'white', borderRadius: '20px', padding: '20px', width: '500px' }}>
      <h4 style={{ color: '#2B3674' }}>전기세 분석</h4>
      <p>조명: {lighting}% / 시스템 에어컨: {aircon}%</p>
    </div>
  );
}

function LineChart({ totalBill }) {
  return (
    <div style={{ background: 'white', borderRadius: '20px', padding: '20px', width: '800px' }}>
      <h4 style={{ color: '#2B3674' }}>전체 전기세</h4>
      <p>{totalBill.toLocaleString()}원</p>
    </div>
  );
}

function RoomRow({ room }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '10px 0',
        borderBottom: '1px solid #eee',
      }}
    >
      <div style={{ fontWeight: 'bold' }}>{room.name}</div>
      <div>{room.usage}kWh</div>
      <div>{room.cost.toLocaleString()}원</div>
    </div>
  );
}

export default DashboardPage;
