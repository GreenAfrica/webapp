'use client';

interface DashboardHeaderProps {
  userName?: string;
  greenId?: string;
  onLogout: () => void;
}

export function DashboardHeader({ userName, greenId, onLogout }: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-xl text-primary-800">
              GreenAfrica
            </h1>
            <p className="text-sm text-gray-600">Welcome back, {userName || 'User'}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">Green ID</p>
              <p className="text-sm text-primary-600 font-mono">{greenId || 'Loading...'}</p>
            </div>
            <button
              title="Logout"
              onClick={onLogout}
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
