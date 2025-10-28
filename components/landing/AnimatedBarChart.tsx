'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface AnimatedBarChartProps {
  color?: string;
  height?: number;
}

export default function AnimatedBarChart({ 
  color = '#8b5cf6',
  height = 300 
}: AnimatedBarChartProps) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // Generate initial data
    const generateData = () => {
      return Array.from({ length: 12 }, (_, i) => ({
        name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
        value: 40 + Math.random() * 60,
        volume: 20 + Math.random() * 40,
      }));
    };

    setData(generateData());

    // Animate data updates
    const interval = setInterval(() => {
      setData((prevData) => {
        return prevData.map(item => ({
          ...item,
          value: Math.max(30, Math.min(100, item.value + (Math.random() - 0.5) * 10)),
          volume: Math.max(15, Math.min(60, item.volume + (Math.random() - 0.5) * 8)),
        }));
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
          <XAxis 
            dataKey="name" 
            stroke="#9ca3af" 
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            stroke="#9ca3af" 
            tick={{ fontSize: 12 }}
            domain={[0, 120]}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.8)', 
              border: 'none',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          <Bar 
            dataKey="value" 
            fill={color}
            radius={[8, 8, 0, 0]}
            animationDuration={500}
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

