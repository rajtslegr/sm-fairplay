import { useEffect } from 'react';

import { useStore } from '@store/useStore';
import { Link, Outlet } from '@tanstack/react-router';

const Root = () => {
  const { players, setShowAbout } = useStore();
  const fileUploaded = players.length > 0;

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background font-inter text-foreground">
      <header className="fixed z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <img
              src="/stemmark-logo.png"
              alt="STEM/MARK logo"
              className="h-8 w-auto transition-opacity hover:opacity-80"
            />
            <nav className="hidden gap-6 sm:flex">
              <Link
                to="/"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{
                  className: 'text-foreground',
                }}
              >
                Fair Play
              </Link>
              {fileUploaded && (
                <Link
                  to="/score"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  activeProps={{
                    className: 'text-foreground',
                  }}
                >
                  Score
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setShowAbout(true)}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              About
            </button>
            <a
              href="https://github.com/rajtslegr/sm-fairplay"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              GitHub
            </a>
          </div>
        </div>
      </header>
      <div className="relative z-10 pt-20">
        <Outlet />
      </div>
    </div>
  );
};

export default Root;
