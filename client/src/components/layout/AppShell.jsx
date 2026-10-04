import TopNav from './TopNav.jsx';
import BottomTabs from './BottomTabs.jsx';
import VerifyBanner from '../VerifyBanner.jsx';

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col pb-16 md:pb-8">
      <TopNav />
      <VerifyBanner />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        {children}
      </main>
      <BottomTabs />
    </div>
  );
}
