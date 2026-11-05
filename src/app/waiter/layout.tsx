import { WaiterProviders } from '@/components/WaiterProviders';
import WaiterLayoutClient from './WaiterLayoutClient';
import { Navbar } from '@/components/Navbar';

export default function WaiterLayout({ children }: { children: React.ReactNode }) {
  return (
    <WaiterProviders>
      <Navbar />
      <WaiterLayoutClient>{children}</WaiterLayoutClient>
    </WaiterProviders>
  );
}