import React, { useEffect, useState } from 'react'
import axios from 'axios'
import ControlBox from '../components/ControlBox'
import StatCard  from '../components/StatCard'

export default function ElectricityAnalysis() {
  const [building, setBuilding] = useState('building1')
  const [date,    setDate]    = useState('2021-04-15')
  const [todayBill, setTodayBill]     = useState(0)
  const [predictMay, setPredictMay]   = useState(0)
  const [predictJun, setPredictJun]   = useState(0)
  const [groupId,    setGroupId]      = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) return
    const headers = { Authorization: `Bearer ${token}` }

    // 1) 당일 전기세 & 그룹ID
    axios.get(
      `http://3.36.111.107/api/building/name/${building}/daily`,
      { headers, params: { date } }
    ).then(res => {
      const d = res.data.result
      if (!d) return
      setTodayBill(Math.floor(d.totalPower))
      setGroupId(d.groupId)
    })

    // 2) 5월·6월 예측
    if (groupId) {
      Promise.all([
        axios.get(`http://3.36.111.107/api/building/${groupId}/2021-05/prediction`, { headers }),
        axios.get(`http://3.36.111.107/api/building/${groupId}/2021-06/prediction`, { headers }),
      ])
      .then(([may, jun]) => {
        setPredictMay(Math.floor(may.data.result.predictedValue))
        setPredictJun(Math.floor(jun.data.result.predictedValue))
      })
    }
  }, [building, date, groupId])

  return (
    <div>
      <div style={{ display:'flex', gap:20, flexWrap:'wrap' }}>
        <ControlBox label="건물 선택">
          <select value={building}
                  onChange={e=>setBuilding(e.target.value)}>
            {Array.from({length:10},(_,i)=>
              <option key={i} value={`building${i+1}`}>
                {`building${i+1}`}
              </option>
            )}
          </select>
        </ControlBox>

        <ControlBox label="날짜 선택">
          <input
            type="date"
            min="2021-04-12"
            max="2021-06-30"
            value={date}
            onChange={e=>setDate(e.target.value)}
          />
        </ControlBox>

        <StatCard title="당일 전기세"   value={`${todayBill.toLocaleString()}원`} />
      </div>

      <div style={{ display:'flex', gap:20, marginTop:20, flexWrap:'wrap' }}>
        <StatCard title="예측 전기세 (05월)" value={`₩ ${predictMay.toLocaleString()}`} />
        <StatCard title="예측 전기세 (06월)" value={`₩ ${predictJun.toLocaleString()}`} />
      </div>
    </div>
  )
}
