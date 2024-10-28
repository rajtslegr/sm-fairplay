import Root from '@components/Root';
import { Homepage } from '@routes/Homepage';
import { Score } from '@routes/Score';
import {
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';

export const rootRoute = createRootRoute({
  component: Root,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Homepage,
});

const statisticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/score',
  component: Score,
});

const routeTree = rootRoute.addChildren([indexRoute, statisticsRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
