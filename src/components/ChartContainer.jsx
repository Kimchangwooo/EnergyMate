import React from 'react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function ChartContainer({ title, data, bar }) {
  return (
    <div className="chart-container">
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height="85%">
        {bar ? (
          <BarChart data={data}>
            ...{/* BarChart 설정 */}
          </BarChart>
        ) : (
          <LineChart data={data}>
            ...{/* LineChart 설정 */}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
