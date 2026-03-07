import { router } from './router';
import AboutModal from '@components/AboutModal';
import { ThemeProvider } from '@components/ThemeProvider';
import { RouterProvider } from '@tanstack/react-router';

const App = () => {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
      <AboutModal />
    </ThemeProvider>
  );
};

export default App;
