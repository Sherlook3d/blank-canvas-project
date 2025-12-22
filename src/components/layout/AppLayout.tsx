import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { cn } from '@/lib/utils';

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar 
        collapsed={collapsed} 
        onToggle={() => setCollapsed(!collapsed)} 
      />
      
      <main 
        className={cn(
          "min-h-screen transition-all duration-300 ease-in-out",
          collapsed ? "ml-16" : "ml-60"
        )}
      >
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
