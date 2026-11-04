import { WaiterProviders } from '@/components/WaiterProviders';
import WaiterLayoutClient from './WaiterLayoutClient';

export default function WaiterLayout({ children }: { children: React.ReactNode }) {
  return (
    <WaiterProviders>
      <WaiterLayoutClient>{children}</WaiterLayoutClient>
    </WaiterProviders>
  );
}