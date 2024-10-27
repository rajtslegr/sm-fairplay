import { ComponentProps } from 'react';

import clsx from 'clsx';

type ButtonProps = ComponentProps<'button'> & {
  active?: boolean;
};

const Button = ({ children, active, disabled, ...props }: ButtonProps) => (
  <button
    className={clsx(
      'w-full cursor-pointer rounded-lg border border-solid border-transparent bg-[#1a1a1a] p-2 text-sm font-medium text-gray-50 transition-colors hover:border-[#982054] sm:w-auto sm:text-base',
      {
        'rounded bg-[#982054]': active,
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
