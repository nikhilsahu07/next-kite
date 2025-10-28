'use client';

import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface AnimatedAreaChartProps {
  color?: string;
  height?: number;
}

export default function AnimatedAreaChart({ 
  color = '#10b981',
  height = 300 
}: AnimatedAreaChartProps) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // Generate initial data
    const generateData = () => {
      return Array.from({ length: 20 }, (_, i) => ({
        name: i.toString(),
        value: 60 + Math.sin(i / 2) * 20 + Math.random() * 15,
        growth: 40 + Math.cos(i / 2) * 15 + Math.random() * 10,
      }));
    };

    setData(generateData());

    // Animate data updates
    const interval = setInterval(() => {
      setData((prevData) => {
        const newData = [...prevData.slice(1)];
        const lastValue = prevData[prevData.length - 1]?.value || 60;
        const lastGrowth = prevData[prevData.length - 1]?.growth || 40;
        
        newData.push({
          name: (prevData.length).toString(),
          value: Math.max(30, Math.min(120, lastValue + (Math.random() - 0.4) * 8)),
          growth: Math.max(20, Math.min(80, lastGrowth + (Math.random() - 0.45) * 6)),
        });
        return newData;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`colorValue-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
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
            domain={[0, 140]}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.8)', 
              border: 'none',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={2}
            fillOpacity={1}
            fill={`url(#colorValue-${color})`}
            animationDuration={300}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

