import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '@/global.css';
import { useColors } from '@/hooks/useColors';
import { DataProvider, useData } from '@/hooks/useData';
import { ThemeProvider, useTheme } from '@/hooks/useTheme';
import { varsForTheme } from '@/styles/themeVars';

SplashScreen.preventAutoHideAsync();

/**
 * Applies the active palette's CSS variables to the whole tree.
 *
 * Because those variables already hold mode-correct values, everything below
 * can style with plain semantic classes (`bg-surface`, `text-content`) and get
 * light or dark for free — there is no `dark:` variant anywhere in this app.
 */
function ThemedRoot() {
    const { palette, resolvedMode, isReady: themeReady } = useTheme();
    const { isReady: dataReady } = useData();
    const colors = useColors();

    const ready = themeReady && dataReady;

    // Hold the splash until the stored theme is back, so the app never flashes
    // the wrong scheme on launch.
    useEffect(() => {
        if (ready) void SplashScreen.hideAsync();
    }, [ready]);

    return (
        <View
            style={varsForTheme(palette, resolvedMode)}
            className="flex-1 bg-surface"
        >
            <StatusBar style={resolvedMode === 'dark' ? 'light' : 'dark'} />

            {ready ? (
                <Stack
                    screenOptions={{
                        headerShown: false,
                        contentStyle: { backgroundColor: colors.surface },
                    }}
                >
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="session/active" />
                    <Stack.Screen name="session/[id]" />
                    <Stack.Screen name="disc/[id]" />
                    <Stack.Screen name="settings" />
                </Stack>
            ) : null}
        </View>
    );
}

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <ThemeProvider>
                    <DataProvider>
                        <ThemedRoot />
                    </DataProvider>
                </ThemeProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
