import Root from '@components/Root';
import { Homepage } from '@routes/Homepage';
import { Score } from '@routes/Score';
import { useStore } from '@store/useStore';
import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router';

const rootRoute = createRootRoute({
  component: Root,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Homepage,
});

const scoreRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/score',
  beforeLoad: () => {
    const state = useStore.getState();

    if (state.players.length === 0) {
      redirect({
        to: '/',
      });
    }
  },
  component: Score,
});

const routeTree = rootRoute.addChildren([indexRoute, scoreRoute]);

export const router = createRouter({
  routeTree,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
