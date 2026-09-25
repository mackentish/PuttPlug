import React from 'react';
import { Pressable, type PressableProps, Text, View } from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'lg';

const base = 'flex-row items-center justify-center gap-2 rounded-2xl';

const sizeClasses: Record<ButtonSize, string> = {
    md: 'px-4 py-3',
    lg: 'px-6 py-5',
};

// `active:` stands in for the web's `hover:` — on touch, pressed is the only
// interactive state there is.
const containerClasses: Record<ButtonVariant, string> = {
    primary: 'bg-primary active:bg-primary-press',
    secondary: 'border-2 border-primary active:bg-primary-soft',
    ghost: 'border border-border active:bg-surface-sunken',
    danger: 'border-2 border-danger active:bg-danger-soft',
};

const labelClasses: Record<ButtonVariant, string> = {
    primary: 'text-content-invert font-semibold',
    secondary: 'text-primary font-semibold',
    ghost: 'text-content font-medium',
    danger: 'text-danger font-semibold',
};

const labelSizeClasses: Record<ButtonSize, string> = {
    md: 'text-base',
    lg: 'text-lg',
};

interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    className?: string;
    /** A string is wrapped in the themed label; nodes render as-is. */
    children: React.ReactNode;
    /** Rendered before the label, inheriting nothing — pass a coloured icon. */
    icon?: React.ReactNode;
}

export function Button({
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    children,
    icon,
    ...props
}: ButtonProps) {
    return (
        <Pressable
            accessibilityRole="button"
            disabled={disabled}
            className={[
                base,
                sizeClasses[size],
                containerClasses[variant],
                disabled ? 'opacity-40' : '',
                className,
            ].join(' ')}
            {...props}
        >
            {icon ? <View>{icon}</View> : null}
            {typeof children === 'string' ? (
                <Text
                    className={`${labelClasses[variant]} ${labelSizeClasses[size]}`}
                >
                    {children}
                </Text>
            ) : (
                children
            )}
        </Pressable>
    );
}
