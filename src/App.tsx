import { router } from './router';
import AboutModal from '@components/AboutModal';
import { useStore } from '@store/useStore';
import { RouterProvider } from '@tanstack/react-router';

const App = () => {
  const { showInfo, setShowInfo } = useStore();

  window.addEventListener('show-info', () => setShowInfo(true));

  return (
    <>
      <RouterProvider router={router} />
      <AboutModal isOpen={showInfo} onClose={() => setShowInfo(false)} />
    </>
  );
};

export default App;
