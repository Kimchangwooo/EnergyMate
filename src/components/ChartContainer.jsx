// src/components/ChartContainer.jsx
import React from 'react'
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'

export default function ChartContainer({ title, data, bar = false }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '20px',
      marginTop: '20px',
      padding: '20px',
      height: '300px',
    }}>
      {/* 제목 글씨색을 진한 네이비로 설정 */}
      <h3 style={{
        color: '#2B3674',
        marginBottom: '16px',
        fontSize: '1.25rem',
      }}>
        {title}
      </h3>

      <ResponsiveContainer width="100%" height="85%">
        {bar ? (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="floor" />
            <YAxis tickFormatter={val => val.toLocaleString()} />
            <Tooltip formatter={value => [value.toLocaleString(), 'kWh']} />
            <Legend />
            <Bar dataKey="usage" fill="#8884d8" />
          </BarChart>
        ) : (
          <RechartsLineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis tickFormatter={val => val.toLocaleString()} />
            <Tooltip formatter={value => [value.toLocaleString(), 'kWh']} />
            <Legend />
            <Line type="monotone" dataKey="usage" stroke="#8884d8" activeDot={{ r: 8 }} />
          </RechartsLineChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
