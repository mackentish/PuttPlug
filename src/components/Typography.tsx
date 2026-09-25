import React from 'react';
import { Text, type TextProps } from 'react-native';

/*
    Every colour class here is mode-agnostic: `text-content` already holds the
    right value for light or dark, so there is never a `dark:` half to keep in
    sync.
*/

type Variant = 'h1' | 'h2' | 'h3' | 'title' | 'body' | 'label' | 'caption';

const variantClasses: Record<Variant, string> = {
    h1: 'text-4xl font-bold text-content',
    h2: 'text-2xl font-bold text-content',
    h3: 'text-xl font-semibold text-content',
    title: 'text-base font-semibold text-content',
    body: 'text-base text-content',
    label: 'text-sm font-medium text-content-muted',
    caption: 'text-xs text-content-muted',
};

interface TypographyProps extends TextProps {
    variant?: Variant;
    className?: string;
    children: React.ReactNode;
}

export function Typography({
    variant = 'body',
    className = '',
    children,
    ...props
}: TypographyProps) {
    return (
        <Text className={`${variantClasses[variant]} ${className}`} {...props}>
            {children}
        </Text>
    );
}
