import { ComponentProps } from 'react';

import clsx from 'clsx';

type ButtonProps = ComponentProps<'button'> & {
  active?: boolean;
};

const Button = ({ children, active, disabled, ...props }: ButtonProps) => (
  <button
    className={clsx(
      'w-full cursor-pointer rounded-lg border border-solid border-transparent bg-background-card p-2 text-sm font-medium text-gray-50 transition-colors hover:border-primary hover:bg-primary/20 hover:text-white sm:w-auto sm:text-base',
      {
        'rounded bg-primary': active,
        'cursor-not-allowed opacity-50': disabled,
      },
    )}
    disabled={disabled}
    {...props}
  >
    {children}
  </button>
);

Button.displayName = 'Button';

export default Button;
