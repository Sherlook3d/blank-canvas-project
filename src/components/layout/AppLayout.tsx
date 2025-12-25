import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { cn } from '@/lib/utils';

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const location = useLocation();

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

  // Page transition effect
  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 50);
    return () => clearTimeout(timer);
  }, [location.pathname]);

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
          <div 
            className={cn(
              "transition-all duration-300 ease-out",
              isTransitioning 
                ? "opacity-0 translate-y-2" 
                : "opacity-100 translate-y-0"
            )}
          >
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
