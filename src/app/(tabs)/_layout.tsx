import { Tabs } from 'expo-router';
import { CreditCard, FileText, Globe, Home, User } from 'lucide-react-native';
import React from 'react';
import { Platform, StyleSheet, useColorScheme, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';

const AnimatedView = Animated.createAnimatedComponent(View);

interface TabIconProps {
  icon: any;
  color: string;
  focused: boolean;
}

function TabIcon({ icon: Icon, color, focused }: TabIconProps) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withSpring(focused ? 1.05 : 1, { damping: 15, stiffness: 200 }) }
      ],
    };
  });

  const bgStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(
        focused ? 'rgba(0, 196, 167, 0.12)' : 'transparent',
        { duration: 200 }
      ),
    };
  });

  return (
    <AnimatedView style={[styles.iconContainer, bgStyle]}>
      <AnimatedView style={animatedStyle}>
        <Icon size={22} color={color} strokeWidth={focused ? 2.5 : 1.8} />
      </AnimatedView>
    </AnimatedView>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isLight = colorScheme !== 'dark';
  const insets = useSafeAreaInsets();

  // Calculate proper bottom padding with safe area
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 24 : 12);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tint,
        tabBarInactiveTintColor: '#9CA3AF',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isLight ? '#FAFAFA' : '#0A0A0A',
          borderTopWidth: 0,
          elevation: 0,
          height: 72 + bottomPadding,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          paddingHorizontal: 16,
          // Soft shadow for floating effect
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: isLight ? 0.04 : 0.1,
          shadowRadius: 12,
        },
        tabBarLabelStyle: {
          fontFamily: Typography.fontFamily.medium,
          fontSize: 11,
          marginTop: 2,
        },
        tabBarItemStyle: {
          height: 60,
          paddingTop: 4,
          paddingBottom: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => <TabIcon icon={Home} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="cards"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color, focused }) => <TabIcon icon={CreditCard} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="passports"
        options={{
          title: 'Passport',
          tabBarIcon: ({ color, focused }) => <TabIcon icon={Globe} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="docs"
        options={{
          title: 'Docs',
          tabBarIcon: ({ color, focused }) => <TabIcon icon={FileText} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="me"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => <TabIcon icon={User} color={color} focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 48,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

});
