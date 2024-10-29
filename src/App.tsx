import { router } from './router';
import AboutModal from '@components/AboutModal';
import { RouterProvider } from '@tanstack/react-router';

const App = () => {
  return (
    <>
      <RouterProvider router={router} />
      <AboutModal />
    </>
  );
};

export default App;
