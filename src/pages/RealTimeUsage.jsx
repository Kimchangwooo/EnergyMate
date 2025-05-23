import React, { useEffect, useState } from 'react'
import axios from 'axios'
import ControlBox     from '../components/ControlBox'
import ChartContainer from '../components/ChartContainer'
import FloorSelector  from '../components/FloorSelector'

export default function RealTimeUsage() {
  const [building, setBuilding] = useState('building1')
  const [date, setDate]         = useState('2021-04-15')
  const [groupId, setGroupId]   = useState(null)
  const [hourData, setHourData] = useState([])
  const [floor, setFloor]       = useState(1)
  const [floorData, setFloorData] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) return
    const headers = { Authorization: `Bearer ${token}` }

    // 당일 시간별 전체 사용량
    axios.get(
      `http://3.36.111.107/api/building/name/${building}/daily`,
      { headers, params:{ date }}
    ).then(res => {
      const d = res.data.result.hourlyData || {}
      setHourData(Object.entries(d).map(([h,v])=>({ hour:h, usage:Math.floor(v) })))
      setGroupId(res.data.result.groupId)
    })
  }, [building, date])

  // 선택된 층 시간별
  useEffect(() => {
    if (!groupId) return
    const token = localStorage.getItem('accessToken')
    const headers = { Authorization: `Bearer ${token}` }

    axios.get(
      `http://3.36.111.107/api/building/${groupId}/floor/${floor}/daily`,
      { headers, params:{ date } }
    ).then(res => {
      const d = res.data.result.hourlyData || {}
      setFloorData(Object.entries(d).map(([h,v])=>({ hour:h, usage:Math.floor(v) })))
    })
  }, [groupId, date, floor])

  return (
    <div>
      <div style={{ display:'flex', gap:20, flexWrap:'wrap' }}>
        <ControlBox label="건물 선택">
          <select value={building}
                  onChange={e=>setBuilding(e.target.value)}>
            {Array.from({length:10},(_,i)=>
              <option key={i} value={`building${i+1}`}>{`building${i+1}`}</option>
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
      </div>

      {/* 전체 시간별 */}
      <ChartContainer
        title="시간별 전력 사용량 (kWh)"
        data={hourData}
      />

      {/* 층별 선택 + 그래프 */}
      <FloorSelector selected={floor} onSelect={setFloor} />
      <ChartContainer
        title={`시간별 사용량 (${floor}층, kWh)`}
        data={floorData}
      />
    </div>
  )
}
