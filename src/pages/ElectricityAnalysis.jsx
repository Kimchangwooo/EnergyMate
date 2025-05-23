import React, { useEffect, useState } from 'react'
import axios from 'axios'
import ControlBox from '../components/ControlBox'
import StatCard   from '../components/StatCard'
import './ElectricityAnalysis.css'

export default function ElectricityAnalysis() {
  const [building,  setBuilding]  = useState('building1')
  const [date,      setDate]      = useState('2021-04-15')
  const [todayBill, setTodayBill] = useState(0)
  const [predMay,   setPredMay]   = useState(0)
  const [predJun,   setPredJun]   = useState(0)

  // 로그인 확인
  useEffect(() => {
    if (!localStorage.getItem('accessToken')) {
      window.location.href = '/login'
    }
  }, [])

  const fetchData = () => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      window.location.href = '/login'
      return
    }
    const headers = { Authorization: `Bearer ${token}` }

    // 1) 당일 전기세 + 그룹ID 조회
    axios.get(
      `http://3.36.111.107/api/building/name/${building}/daily`,
      { headers, params: { date } }
    ).then(res => {
      const d = res.data.result
      if (!d) return

      setTodayBill(Math.floor(d.totalPower) || 0)
      const gid = d.groupId

      // 2) 5월·6월 예측전기세 조회
      Promise.all([
        axios.get(`http://3.36.111.107/api/building/${gid}/2021-05/prediction`, { headers }),
        axios.get(`http://3.36.111.107/api/building/${gid}/2021-06/prediction`, { headers }),
      ]).then(([mayRes, junRes]) => {
        setPredMay(Math.floor(mayRes.data.result?.predictedValue) || 0)
        setPredJun(Math.floor(junRes.data.result?.predictedValue) || 0)
      }).catch(console.error)

    }).catch(console.error)
  }

  return (
    <div className="analysis-grid">
      {/* 1행: 헤더 + 버튼 */}
      <header className="analysis-header">
        <h2>전기세 분석</h2>
        <button className="fetch-button" onClick={fetchData}>데이터 요청하기</button>
      </header>

      {/* 2행: 컨트롤 박스 + 당일 전기세 */}
      <ControlBox label="건물 선택" className="card control-card">
        <select value={building} onChange={e => setBuilding(e.target.value)}>
          {Array.from({ length: 10 }, (_, i) =>
            <option key={i} value={`building${i+1}`}>{`building${i+1}`}</option>
          )}
        </select>
      </ControlBox>

      <ControlBox label="날짜 선택" className="card control-card">
        <input
          type="date"
          min="2021-04-12"
          max="2021-06-30"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
      </ControlBox>

      <StatCard
        title="당일 전기세"
        value={`${todayBill.toLocaleString()}원`}
        className="card stat-card"
      />

      {/* 3행: 5월·6월 예측 전기세 */}
      <StatCard
        title="예측 전기세 (05월)"
        value={`₩ ${predMay.toLocaleString()}`}
        className="card stat-card"
      />
      <StatCard
        title="예측 전기세 (06월)"
        value={`₩ ${predJun.toLocaleString()}`}
        className="card stat-card"
      />
    </div>
  )
}
