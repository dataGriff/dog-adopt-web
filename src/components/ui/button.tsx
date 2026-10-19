import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { buttonClasses, type ButtonSize, type ButtonVariant } from './button-classes';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = 'default', size = 'md', type = 'button', ...props }, ref) => (
  <button ref={ref} type={type} className={buttonClasses(variant, size, className)} {...props} />
));
Button.displayName = 'Button';
