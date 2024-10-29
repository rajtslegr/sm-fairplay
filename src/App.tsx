import { router } from './router';
import AboutModal from '@components/AboutModal';
import { useStore } from '@store/useStore';
import { RouterProvider } from '@tanstack/react-router';

const App = () => {
  const { showAbout, setShowAbout } = useStore();

  window.addEventListener('show-about', () => setShowAbout(true));

  return (
    <>
      <RouterProvider router={router} />
      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
    </>
  );
};

export default App;
