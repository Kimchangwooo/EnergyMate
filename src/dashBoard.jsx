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
  BarChart,
  Bar,
} from 'recharts';

function DashboardPage() {
  const navigate = useNavigate();

  const [selectedBuilding, setSelectedBuilding] = useState('building1');
  const [selectedDate, setSelectedDate] = useState('2021-04-15');
  const [predictedMay, setPredictedMay] = useState(0);
  const [predictedJun, setPredictedJun] = useState(0);
  const [totalBill, setTotalBill] = useState(0);
  const [hourlyData, setHourlyData] = useState([]);
  const [groupId, setGroupId] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [floorHourlyData, setFloorHourlyData] = useState([]);

  // 로그인 확인
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) navigate('/login');
  }, [navigate]);

  // 건물 & 날짜 데이터 조회
  const fetchData = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return navigate('/login');
    if (!selectedBuilding || !selectedDate) return;

    const headers = { Authorization: `Bearer ${token}` };

    // 당일 데이터
    axios
      .get(
        `http://3.36.111.107/api/building/name/${selectedBuilding}/daily`,
        { headers, params: { date: selectedDate } }
      )
      .then((res) => {
        const d = res.data.result;
        if (!d) return;

        setTotalBill(d.totalPower || 0);
        setHourlyData(
          Object.entries(d.hourlyData).map(([h, v]) => ({ hour: h, usage: v }))
        );

        // 그룹 ID 저장 및 초기 층별 호출
        setGroupId(d.groupId);
      })
      .catch((err) => console.error(err));

    // 예측 전기세 (5월, 6월)
    if (groupId) {
      Promise.all([
        axios.get(
          `http://3.36.111.107/api/building/${groupId}/2021-05/prediction`,
          { headers }
        ),
        axios.get(
          `http://3.36.111.107/api/building/${groupId}/2021-06/prediction`,
          { headers }
        ),
      ])
        .then(([mayRes, junRes]) => {
          setPredictedMay(mayRes.data.result?.predictedValue ?? 0);
          setPredictedJun(junRes.data.result?.predictedValue ?? 0);
        })
        .catch(() => {});
    }
  };

  // 선택된 층의 시간별 사용량 조회
  const fetchFloorHourly = (floor) => {
    if (!groupId) return;
    const token = localStorage.getItem('accessToken');
    const headers = { Authorization: `Bearer ${token}` };

    axios
      .get(
        `http://3.36.111.107/api/building/${groupId}/floor/${floor}/daily`,
        { headers, params: { date: selectedDate } }
      )
      .then((r) => {
        const data = r.data.result.hourlyData || {};
        setFloorHourlyData(
          Object.entries(data).map(([h, v]) => ({ hour: h, usage: v }))
        );
      })
      .catch(() => setFloorHourlyData([]));
  };

  // 그룹ID, 선택날짜, 선택층 변경시 호출
  useEffect(() => {
    if (groupId) {
      fetchFloorHourly(selectedFloor);
    }
  }, [groupId, selectedDate, selectedFloor]);

  return (
    <div
      style={{
        background: '#F4F7FE',
        minHeight: '100vh',
        padding: '32px',
        width: '100%',
        overflowX: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}
      >
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

      {/* 1st row */}
      <div
        style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}
      >
        <Control
          label="건물 선택"
          value={selectedBuilding}
          onChange={setSelectedBuilding}
        />
        <Control
          label="날짜 선택"
          isDate
          value={selectedDate}
          onChange={setSelectedDate}
        />
        <Card title="당일 전기세" value={`${totalBill.toLocaleString()}원`} width={300} />
      </div>

      {/* 2nd row */}
      <div
        style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}
      >
        <Card title="예상 전기세 (05월)" value={`₩ ${predictedMay.toLocaleString()}`} />
        <Card title="예상 전기세 (06월)" value={`₩ ${predictedJun.toLocaleString()}`} />
      </div>

      {/* Charts */}
      <ChartContainer title="시간별 전력 사용량" data={hourlyData} />

      {/* Floor selector */}
      <div
        style={{ display: 'flex', gap: '8px', marginTop: '40px', flexWrap: 'wrap' }}
      >
        {[1, 2, 3, 4, 5, 6].map((floor) => (
          <button
            key={floor}
            onClick={() => setSelectedFloor(floor)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: selectedFloor === floor ? 'none' : '1px solid #2B3674',
              backgroundColor: selectedFloor === floor ? '#2B3674' : 'white',
              color: selectedFloor === floor ? 'white' : '#2B3674',
              cursor: 'pointer',
            }}
          >
            {floor}층
          </button>
        ))}
      </div>

      {/* Floor hourly chart */}
      <ChartContainer
        title={`시간별 사용량 (${selectedFloor}층)`}
        data={floorHourlyData}
      />
    </div>
  );
}

function Control({ label, value, onChange, isDate }) {
  return (
    <div
      style={{ background: 'white', borderRadius: '20px', padding: '20px', width: '300px' }}
    >
      <div style={{ color: '#A3AED0', fontSize: '14px' }}>{label}</div>
      {isDate ? (
        <input
          type="date"
          min="2021-04-12"
          max="2021-06-30"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            marginTop: '8px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            fontSize: '16px',
            color: '#fff',
            backgroundColor: '#000',
          }}
        />
      ) : (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            marginTop: '8px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            fontSize: '16px',
            backgroundColor: '#fff',
            color: '#2B3674',
          }}
        >
          {Array.from({ length: 10 }, (_, i) => (
            <option key={i} value={`building${i + 1}`}>{`building${i + 1}`}</option>
          ))}
        </select>
      )}
    </div>
  );
}

function Card({ title, value, width = 300 }) {
  return (
    <div style={{ background: 'white', borderRadius: '20px', padding: '20px', width }}>
      <div style={{ color: '#A3AED0', fontSize: '14px' }}>{title}</div>
      <div style={{ color: '#000', fontSize: '24px', fontWeight: 'bold' }}>{value}</div>
    </div>
  );
}

function ChartContainer({ title, data, bar = false }) {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: '20px',
        marginTop: '20px',
        padding: '20px',
        height: '300px',
      }}
    >
      <h3 style={{ color: '#000', marginBottom: 0 }}>{title}</h3>
      <ResponsiveContainer width="100%" height="85%">
        {bar ? (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="floor" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="usage" fill="#8884d8" />
          </BarChart>
        ) : (
          <RechartsLineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="usage" stroke="#8884d8" activeDot={{ r: 8 }} />
          </RechartsLineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

export default DashboardPage;
