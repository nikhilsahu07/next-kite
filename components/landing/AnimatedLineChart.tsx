'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface AnimatedLineChartProps {
  initialData?: any[];
  color?: string;
  height?: number;
}

export default function AnimatedLineChart({ 
  initialData, 
  color = '#3b82f6',
  height = 300 
}: AnimatedLineChartProps) {
  const [data, setData] = useState(initialData || []);

  useEffect(() => {
    if (initialData) {
      setData(initialData);
      return;
    }

    // Generate initial data
    const generateData = () => {
      return Array.from({ length: 20 }, (_, i) => ({
        name: i.toString(),
        value: 50 + Math.random() * 50 + i * 2,
      }));
    };

    setData(generateData());

    // Animate data updates
    const interval = setInterval(() => {
      setData((prevData) => {
        const newData = [...prevData.slice(1)];
        const lastValue = prevData[prevData.length - 1]?.value || 50;
        newData.push({
          name: (prevData.length).toString(),
          value: Math.max(20, Math.min(150, lastValue + (Math.random() - 0.5) * 10)),
        });
        return newData;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [initialData]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
          <XAxis 
            dataKey="name" 
            stroke="#9ca3af" 
            tick={{ fontSize: 12 }}
            hide
          />
          <YAxis 
            stroke="#9ca3af" 
            tick={{ fontSize: 12 }}
            domain={[0, 160]}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.8)', 
              border: 'none',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={2}
            dot={false}
            animationDuration={300}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

