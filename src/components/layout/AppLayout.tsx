import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { UserMenu } from './UserMenu';
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
      
      {/* Top bar with user menu */}
      <div 
        className={cn(
          "fixed top-0 right-0 h-16 flex items-center justify-end px-6 z-40 transition-all duration-300",
          collapsed ? "left-16" : "left-60"
        )}
      >
        <UserMenu />
      </div>
      
      <main 
        className={cn(
          "min-h-screen transition-all duration-300 ease-in-out pt-16",
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
