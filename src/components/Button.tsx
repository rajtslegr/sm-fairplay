import { ComponentProps, forwardRef } from 'react';

type ButtonProps = ComponentProps<'button'> & {
  active?: boolean;
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, active, ...props }, ref) => (
    <button
      className={`cursor-pointer rounded-lg border border-solid border-transparent bg-[#1a1a1a] p-2 text-base font-medium text-gray-50 transition-colors hover:border-[#646cff] ${
        active ? 'rounded bg-[#646cff]' : ''
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
