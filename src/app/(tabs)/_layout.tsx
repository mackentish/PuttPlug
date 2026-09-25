import { Ionicons } from '@expo/vector-icons';
// The `Tabs` export from 'expo-router' itself is deprecated in SDK 57; this is
// the JS-rendered tab bar, which is what lets it take the app's theme colours.
import { Tabs } from 'expo-router/js-tabs';
import React from 'react';
import { useColors } from '@/hooks/useColors';

export default function TabsLayout() {
    const colors = useColors();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors['content-muted'],
                tabBarStyle: {
                    backgroundColor: colors['surface-raised'],
                    borderTopColor: colors.border,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name="stats-chart"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="sessions"
                options={{
                    title: 'Sessions',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="calendar" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="bag"
                options={{
                    title: 'Bag',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="disc" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
