import { ComponentProps, forwardRef } from 'react';

type ButtonProps = ComponentProps<'button'> & {
  active?: boolean;
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, active, ...props }, ref) => (
    <button
      className={`w-full cursor-pointer rounded-lg border border-solid border-transparent bg-[#1a1a1a] p-2 text-sm font-medium text-gray-50 transition-colors hover:border-[#982054] sm:w-auto sm:text-base ${
        active ? 'rounded bg-[#982054]' : ''
      }`}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  ),
);

Button.displayName = 'Button';

export default Button;
