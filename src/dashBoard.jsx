import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function DashboardPage() {
  const navigate = useNavigate();

  const [selectedBuilding, setSelectedBuilding] = useState('building1');
  const [selectedDate, setSelectedDate] = useState('2021-04-15');
  const [activeUsers, setActiveUsers] = useState(0);
  const [predictedBill, setPredictedBill] = useState(0);
  const [totalBill, setTotalBill] = useState(0);
  const [roomStats, setRoomStats] = useState([]);
  const [pieData, setPieData] = useState({ lighting: 0, aircon: 0 });

  // 로그인 토큰 검사 및 로그인 페이지 리다이렉트
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      navigate('/login');
    }
  }, [navigate]);

  // 데이터 요청 버튼 클릭 시 호출하는 API 함수
  const fetchData = () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      navigate('/login');
      return;
    }
    if (!selectedBuilding || !selectedDate) return;

    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    const month = selectedDate.slice(0, 7);
    const floor = 1;

    axios
      .get(`http://3.36.111.107/api/building/name/${selectedBuilding}/daily`, {
        headers,
        params: { date: selectedDate },
      })
      .then((res) => {
        const data = res.data?.result;
        if (!data) {
          console.warn('⚠️ result가 없습니다.');
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

        const groupId = data.groupId;

        axios
          .get(`http://3.36.111.107/api/building/${groupId}/${month}/prediction`, { headers })
          .then((res) => {
            const predicted = res.data?.result?.predictedValue ?? 0;
            setPredictedBill(predicted);
          })
          .catch((err) => console.error('예측 전기세 조회 실패:', err));

        axios
          .get(`http://3.36.111.107/api/building/${groupId}/floor/${floor}/daily`, {
            headers,
            params: { date: selectedDate },
          })
          .then((res) => console.log('✅ 층별 실시간 사용량:', res.data?.result))
          .catch((err) => console.error('층별 데이터 조회 실패:', err));

        axios
          .get(`http://3.36.111.107/api/building/${groupId}/floor/${floor}/${month}/prediction`, {
            headers,
          })
          .then((res) => console.log('✅ 층별 예측 사용량:', res.data?.result?.totalUsage))
          .catch((err) => console.error('층별 예측 사용량 조회 실패:', err));

        axios
          .get(`http://3.36.111.107/api/building/${groupId}/daily`, {
            headers,
            params: { date: selectedDate },
          })
          .then((res) => console.log('✅ 그룹 ID 기반 전력 사용량:', res.data?.result))
          .catch((err) => console.error('그룹 전력 사용량 조회 실패:', err));
      })
      .catch((err) => console.error('빌딩 데이터 조회 실패:', err));
  };

  return (
    <div style={{ background: '#F4F7FE', minHeight: '100vh', padding: '32px' }}>
      {/* 제목과 버튼 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <h2 style={{ color: '#2B3674', margin: 0 }}>대시보드</h2>
        <button
          onClick={fetchData}
          style={{
            padding: '6px 12px',
            fontSize: '14px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: '#2B3674',
            color: 'white',
          }}
        >
          데이터 요청하기
        </button>
      </div>

      {/* 선택 UI */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '20px', width: '300px' }}>
          <div style={{ color: '#A3AED0', fontSize: '14px' }}>건물 선택</div>
          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              marginTop: '8px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              fontSize: '16px',
              backgroundColor: '#fff',
              color: '#2B3674',
              appearance: 'none',
            }}
          >
            {Array.from({ length: 10 }, (_, i) => (
              <option key={i} value={`building${i + 1}`}>
                building{i + 1}
              </option>
            ))}
          </select>
        </div>

        <div style={{ background: 'white', borderRadius: '20px', padding: '20px', width: '300px' }}>
          <div style={{ color: '#A3AED0', fontSize: '14px' }}>날짜 선택</div>
          <input
            type="date"
            min="2021-04-01"
            max="2021-06-30"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              marginTop: '8px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              fontSize: '16px',
              color: '#2B3674',
            }}
          />
        </div>

        <Card title="예상 전기세" value={`₩ ${predictedBill.toLocaleString()}`} />
        <Card title="Active users" value={activeUsers} />
      </div>

      {/* 차트 */}
      <div style={{ display: 'flex', marginTop: '20px', gap: '20px' }}>
        <PieChart lighting={pieData.lighting} aircon={pieData.aircon} />
        <LineChart totalBill={totalBill} />
      </div>

      {/* 그룹별 통계 */}
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
