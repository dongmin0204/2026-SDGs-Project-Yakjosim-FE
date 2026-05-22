import { useLocation, useNavigate } from 'react-router';
import { Home, Search, ClipboardList, Settings } from 'lucide-react';

const navItems = [
  { path: '/home', label: '홈', icon: Home },
  { path: '/search', label: '검색', icon: Search },
  { path: '/combine', label: '분석', icon: ClipboardList },
  { path: '/settings', label: '설정', icon: Settings },
] as const;

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav
      data-slot="bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white"
    >
      <div
        data-slot="bottom-nav-inner"
        className="mx-auto flex h-16 max-w-lg items-center justify-around"
      >
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <button
              data-slot="bottom-nav-button"
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors ${
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
