import { Outlet } from 'react-router-dom';
import SidePanel from './SidePanel.jsx';
import VerifyBanner from '../VerifyBanner.jsx';

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col md:flex-row">
      <SidePanel />
      <div className="flex-1 md:pl-64 flex flex-col min-w-0 min-h-screen">
        <VerifyBanner />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
