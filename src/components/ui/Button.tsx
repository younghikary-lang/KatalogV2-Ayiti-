import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = '', variant = 'primary', size = 'md', ...props }, ref) => {
        const baseStyles = "inline-flex items-center justify-center rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 disabled:pointer-events-none";

        const variants = {
            primary: "btn-primary",
            secondary: "bg-muted text-foreground hover:bg-border",
            outline: "border border-border hover:bg-muted text-foreground",
            ghost: "hover:bg-muted text-foreground",
        };

        const sizes = {
            sm: "h-8 px-3 text-xs",
            md: "h-11 px-6 py-2 text-sm",
            lg: "h-14 px-8 text-base",
            icon: "h-10 w-10",
        };

        return (
            <button
                ref={ref}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"
