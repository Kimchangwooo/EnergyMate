import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

function DashboardPage() {
  const navigate = useNavigate();

  const [selectedBuilding, setSelectedBuilding] = useState('building1');
  const [selectedDate, setSelectedDate] = useState('2021-04-15');
  const [activeUsers, setActiveUsers] = useState(0);
  const [predictedBill, setPredictedBill] = useState(0);
  const [totalBill, setTotalBill] = useState(0);
  const [pieData, setPieData] = useState({ lighting: 0, aircon: 0 });
  const [hourlyData, setHourlyData] = useState([]);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      navigate('/login');
    }
  }, [navigate]);

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

        // 시간별 데이터 배열 변환
        const hourlyArray = Object.entries(data.hourlyData || {}).map(([hour, value]) => ({
          hour,
          usage: value,
        }));
        setHourlyData(hourlyArray);

        const groupId = data.groupId;

        axios
          .get(`http://3.36.111.107/api/building/${groupId}/${month}/prediction`, { headers })
          .then((res) => {
            const predicted = res.data?.result?.predictedValue ?? 0;
            setPredictedBill(predicted);
          })
          .catch((err) => console.error('예측 전기세 조회 실패:', err));
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
              color: '#ffffff',
              backgroundColor: '#000000',
            }}
          />
        </div>

        <Card title="예상 전기세" value={`₩ ${predictedBill.toLocaleString()}`} />
        <Card title="Active users" value={activeUsers} />
      </div>

      {/* 차트 */}
      <div style={{ display: 'flex', marginTop: '20px', gap: '20px' }}>
        <PieChart lighting={pieData.lighting} aircon={pieData.aircon} />
        <SummaryLineChart totalBill={totalBill} style={{ flex: 1, maxWidth: '400px' }} />
      </div>

      {/* 시간별 전력 사용량 차트 */}
      <div
        style={{
          background: 'white',
          borderRadius: '20px',
          marginTop: '40px',
          padding: '20px',
          height: '300px',
        }}
      >
        <h3 style={{ color: '#000000' }}>시간별 전력 사용량</h3>
        <ResponsiveContainer width="100%" height="90%">
          <RechartsLineChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="usage" stroke="#8884d8" activeDot={{ r: 8 }} />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div style={{ background: 'white', borderRadius: '20px', padding: '20px', width: '300px' }}>
      <div style={{ color: '#A3AED0', fontSize: '14px' }}>{title}</div>
      <div style={{ color: '#000000', fontSize: '24px', fontWeight: 'bold' }}>{value}</div>
    </div>
  );
}

function PieChart({ lighting, aircon }) {
  return (
    <div style={{ background: 'white', borderRadius: '20px', padding: '20px', width: '500px' }}>
      <h4 style={{ color: '#000000' }}>전기세 분석</h4>
      <p style={{ color: '#000000' }}>
        조명: {lighting}% / 시스템 에어컨: {aircon}%
      </p>
    </div>
  );
}

function SummaryLineChart({ totalBill }) {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: '20px',
        padding: '20px',
        maxWidth: '400px',
        width: '100%',
      }}
    >
      <h4 style={{ color: '#000000' }}>전체 전기세</h4>
      <p style={{ color: '#000000' }}>{totalBill.toLocaleString()}원</p>
    </div>
  );
}

export default DashboardPage;
 