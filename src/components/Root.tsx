import { useStore } from '@store/useStore';
import { Link, Outlet } from '@tanstack/react-router';

const Root = () => {
  const { players } = useStore();
  const fileUploaded = players.length > 0;

  return (
    <div className="flex min-h-screen flex-col bg-background font-inter text-gray-50">
      <header className="fixed z-20 w-full">
        <div className="bg-background/70 shadow-md backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <img
                src="/stemmark-logo.png"
                alt="STEM/MARK logo"
                className="h-8 w-auto"
              />
              <nav className="flex space-x-4">
                <Link
                  to="/"
                  className="text-gray-300 hover:text-[#982054]"
                  activeProps={{
                    className: `${fileUploaded ? 'text-[#982054]' : ''}`,
                  }}
                >
                  Fair Play
                </Link>
                {fileUploaded && (
                  <Link
                    to="/score"
                    className="text-gray-300 hover:text-[#982054]"
                    activeProps={{
                      className: 'text-[#982054]',
                    }}
                  >
                    Score
                  </Link>
                )}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.dispatchEvent(new Event('show-about'))}
                className="text-gray-300 hover:text-[#982054]"
              >
                About
              </button>
              <a
                href="https://github.com/rajtslegr/sm-fairplay"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-[#982054]"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </header>
      <div className="relative z-10 pt-24 sm:pt-16">
        <Outlet />
      </div>
    </div>
  );
};

export default Root;
