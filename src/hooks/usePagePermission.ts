import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function usePagePermission(pageKey: string) {
  const { user, role } = useAuth();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPermission = async () => {
      // Owner always has access
      if (role === 'owner') {
        setHasPermission(true);
        setIsLoading(false);
        return;
      }

      if (!user || !role) {
        setHasPermission(false);
        setIsLoading(false);
        return;
      }

      try {
        // Get the user's hotel_id
        const { data: profileData } = await supabase
          .from('profiles')
          .select('hotel_id')
          .eq('id', user.id)
          .maybeSingle();

        if (!profileData?.hotel_id) {
          // If no hotel, use default permissions
          setHasPermission(getDefaultPermission(role, pageKey));
          setIsLoading(false);
          return;
        }

        // Check for specific permission
        const { data: permData } = await supabase
          .from('role_permissions')
          .select('can_access')
          .eq('hotel_id', profileData.hotel_id)
          .eq('role', role)
          .eq('page_key', pageKey)
          .maybeSingle();

        if (permData !== null) {
          setHasPermission(permData.can_access);
        } else {
          // Use defaults if no specific permission set
          setHasPermission(getDefaultPermission(role, pageKey));
        }
      } catch (error) {
        console.error('Error checking permission:', error);
        setHasPermission(getDefaultPermission(role, pageKey));
      } finally {
        setIsLoading(false);
      }
    };

    checkPermission();
  }, [user, role, pageKey]);

  return { hasPermission, isLoading };
}

function getDefaultPermission(role: string, pageKey: string): boolean {
  if (role === 'owner') return true;
  
  if (role === 'manager') return true;
  
  if (role === 'receptionist') {
    return ['dashboard', 'chambres', 'reservations', 'clients'].includes(pageKey);
  }
  
  return false;
}
