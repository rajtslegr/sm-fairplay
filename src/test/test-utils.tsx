import '@testing-library/jest-dom';

import { cleanup, render } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});

const customRender = (ui: React.ReactElement, options = {}) => {
  render(ui, {
    wrapper: ({ children }) => <>{children}</>,
    ...options,
  });
};

/* eslint-disable import/export -- customRender intentionally shadows Testing Library's render */
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

export { customRender as render };
