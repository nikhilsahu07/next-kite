'use client';

import { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setIsSidebarCollapsed} 
      />
      <motion.main
        className="flex-1 overflow-x-auto transition-all duration-300"
        initial={false}
        animate={{
          marginLeft: isSidebarCollapsed ? '4rem' : '16rem', // w-16 vs w-64
        }}
      >
        {children}
      </motion.main>
    </div>
  );
}

