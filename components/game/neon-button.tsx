import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost'
  size?: 'md' | 'lg' | 'icon'
}

export function NeonButton({ variant = 'primary', size = 'md', className, ...props }: NeonButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-display font-bold tracking-wider uppercase transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 active:scale-95',
        variant === 'primary' &&
          'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-[0_0_24px_-4px_var(--primary)] hover:shadow-[0_0_36px_-2px_var(--accent)] hover:brightness-110',
        variant === 'ghost' &&
          'border border-border bg-card/60 text-foreground backdrop-blur hover:border-primary/60 hover:bg-card hover:text-primary',
        size === 'md' && 'h-11 px-5 text-sm',
        size === 'lg' && 'h-14 px-10 text-base',
        size === 'icon' && 'size-10 shrink-0',
        className,
      )}
      {...props}
    />
  )
}
