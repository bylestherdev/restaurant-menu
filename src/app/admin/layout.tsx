import { AdminProviders } from '@/components/AdminProviders';
import AdminLayoutClient from './AdminLayoutClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin - La Casa del Sabor',
  description: 'Panel de administración del restaurante',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProviders>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </AdminProviders>
  );
}