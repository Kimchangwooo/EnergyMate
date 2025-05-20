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
  const [predictedBill, setPredictedBill] = useState(0);
  const [predictedMay, setPredictedMay] = useState(0);
  const [predictedJun, setPredictedJun] = useState(0);
  const [totalBill, setTotalBill] = useState(0);
  const [pieData, setPieData] = useState({ lighting: 0, aircon: 0 });
  const [hourlyData, setHourlyData] = useState([]);
  const [floorData, setFloorData] = useState([]); // 1~6층 사용량

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) navigate('/login');
  }, [navigate]);

  const fetchData = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return navigate('/login');
    if (!selectedBuilding || !selectedDate) return;

    const headers = { Authorization: `Bearer ${token}` };
    const month = selectedDate.slice(0, 7);
    const monthMay = '2021-05';
    const monthJun = '2021-06';

    // 빌딩 일별 데이터
    axios
      .get(
        `http://3.36.111.107/api/building/name/${selectedBuilding}/daily`,
        { headers, params: { date: selectedDate } }
      )
      .then((res) => {
        const d = res.data.result;
        if (!d) return console.warn('result empty');

        // 전체 전기세
        setTotalBill(d.totalPower || 0);
        // 파이 차트용 데이터
        setPieData({
          lighting: d.hourlyData?.additionalProp1 || 0,
          aircon: d.hourlyData?.additionalProp2 || 0,
        });
        // 시간별 데이터
        setHourlyData(
          Object.entries(d.hourlyData || {}).map(([h, v]) => ({ hour: h, usage: v }))
        );

        const groupId = d.groupId;

        // 예측 전기세 - 선택월
        axios
          .get(
            `http://3.36.111.107/api/building/${groupId}/${month}/prediction`,
            { headers }
          )
          .then((r) => setPredictedBill(r.data.result?.predictedValue ?? 0))
          .catch(() => {});
        // 예측 전기세 - 05월
        axios
          .get(
            `http://3.36.111.107/api/building/${groupId}/${monthMay}/prediction`,
            { headers }
          )
          .then((r) => setPredictedMay(r.data.result?.predictedValue ?? 0))
          .catch(() => {});
        // 예측 전기세 - 06월
        axios
          .get(
            `http://3.36.111.107/api/building/${groupId}/${monthJun}/prediction`,
            { headers }
          )
          .then((r) => setPredictedJun(r.data.result?.predictedValue ?? 0))
          .catch(() => {});

        // 1~6층 실시간 사용량
        Promise.all(
          [1, 2, 3, 4, 5, 6].map((floor) =>
            axios
              .get(
                `http://3.36.111.107/api/building/${groupId}/floor/${floor}/daily`,
                { headers, params: { date: selectedDate } }
              )
              .then((r) => ({ floor, usage: r.data.result?.totalPower ?? 0 }))
              .catch(() => ({ floor, usage: 0 }))
          )
        ).then(setFloorData);
      })
      .catch((err) => console.error(err));
  };

  return (
    <div style={{ background: '#F4F7FE', minHeight: '100vh', padding: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <h2 style={{ color: '#2B3674', margin: 0 }}>대시보드</h2>
        <button
          onClick={fetchData}
          style={{
            padding: '6px 12px', fontSize: '14px',
            borderRadius: '6px', border: 'none',
            cursor: 'pointer', backgroundColor: '#2B3674', color: 'white',
          }}
        >
          데이터 요청하기
        </button>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <Control label="건물 선택" value={selectedBuilding} onChange={setSelectedBuilding} />
        <Control
          label="날짜 선택"
          isDate
          value={selectedDate}
          onChange={setSelectedDate}
        />
        <Card title="예상 전기세(선택월)" value={`₩ ${predictedBill.toLocaleString()}`} />
        <Card title="예상 전기세(05월)" value={`₩ ${predictedMay.toLocaleString()}`} />
        <Card title="예상 전기세(06월)" value={`₩ ${predictedJun.toLocaleString()}`} />
        <Card title="전체 전기세" value={`${totalBill.toLocaleString()}원`} width={300} />
      </div>

      {/* 전기세 분석 (파이) */}
      <div style={{ background: 'white', borderRadius: '20px', padding: '20px', marginTop: '20px', width: '500px' }}>
        <h4 style={{ color: '#000' }}>전기세 분석</h4>
        <p style={{ color: '#000' }}>
          조명: {pieData.lighting}% / 시스템 에어컨: {pieData.aircon}%
        </p>
      </div>

      {/* 시간별 사용량 차트 */}
      <ChartContainer title="시간별 전력 사용량" data={hourlyData} />

      {/* 1~6층 실시간 사용량 차트 */}
      <ChartContainer title="층별 실시간 사용량 (1~6층)" data={floorData} bar />

    </div>
  );
}

// reusable controls
function Control({ label, value, onChange, isDate }) {
  return (
    <div style={{ background: 'white', borderRadius: '20px', padding: '20px', width: '300px' }}>
      <div style={{ color: '#A3AED0', fontSize: '14px' }}>{label}</div>
      {isDate ? (
        <input
          type="date"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            width: '100%', padding: '10px', marginTop: '8px', borderRadius: '8px',
            border: '1px solid #ccc', fontSize: '16px', color: '#fff', backgroundColor: '#000',
          }}
        />
      ) : (
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            width: '100%', padding: '10px', marginTop: '8px', borderRadius: '8px',
            border: '1px solid #ccc', fontSize: '16px', backgroundColor: '#fff', color: '#2B3674',
          }}
        >
          {Array.from({ length: 10 }, (_, i) => (
            <option key={i} value={`building${i + 1}`}>
              building{i + 1}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

// 카드
function Card({ title, value, width = 300 }) {
  return (
    <div style={{ background: 'white', borderRadius: '20px', padding: '20px', width }}>
      <div style={{ color: '#A3AED0', fontSize: '14px' }}>{title}</div>
      <div style={{ color: '#000', fontSize: '24px', fontWeight: 'bold' }}>{value}</div>
    </div>
  );
}

// 차트 렌더러
function ChartContainer({ title, data, bar = false }) {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: '20px',
        marginTop: '40px',
        padding: '20px',
        height: '300px',
      }}
    >
      <h3 style={{ color: '#000', marginBottom: 0 }}>{title}</h3>
      <ResponsiveContainer width="100%" height="85%">
        {bar ? (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={bar ? 'floor' : 'hour'} />
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
