
import React, { useEffect } from 'react';
import AdminLayout from '@/components/admin/layout/AdminLayout';
import AdminTabs from '@/components/admin/navigation/AdminTabs';
import { useAuth } from '@/contexts/AuthContext';

const Admin = () => {
  const { user } = useAuth();

  useEffect(() => {
    // Log that we've successfully reached the admin page
    console.log('Admin page accessed by:', user?.email);
    console.log('User metadata:', user?.app_metadata);
  }, [user]);

  return (
    <AdminLayout>
      <AdminTabs />
    </AdminLayout>
  );
};

export default Admin;
