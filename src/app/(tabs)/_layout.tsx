import { Tabs, useRouter } from "expo-router";
import { CreditCard, FileText, Globe, Home, Lock, Shield, User } from "lucide-react-native";
import React, { useEffect } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import RecoveryFlow from "@/components/auth/RecoveryFlow";
import { Colors } from "@/constants/Colors";
import { Typography } from "@/constants/Typography";
import { useAuth } from "@/context/AuthContext";
import { useSecurity } from "@/context/SecurityContext";
import type { UserInfo } from "firebase/auth";

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
        {
          scale: withSpring(focused ? 1.05 : 1, {
            damping: 15,
            stiffness: 200,
          }),
        },
      ],
    };
  });

  const bgStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(
        focused ? "rgba(0, 196, 167, 0.12)" : "transparent",
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
  const theme = Colors[colorScheme ?? "light"];
  const isLight = colorScheme !== "dark";
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, userProfile, initializing } = useAuth();
  const { isVaultInitialized, isUnlocked, unlockVault } = useSecurity();

  const isOAuthUser = user?.providerData.some(
    (p: UserInfo) => p.providerId !== "password"
  );
  const isVerified = !!user && (user.emailVerified || isOAuthUser);

  useEffect(() => {
    if (initializing) return;

    if (!user || !isVerified) {
      router.replace("/(auth)/sign-in" as any);
    }
  }, [user, isVerified, initializing, router]);

  useEffect(() => {
    if (initializing) return;

    // Only check NIC if user is verified
    if (user && isVerified && userProfile !== undefined) {
      // Check if profile is loaded and nic_last4 is explicitly missing
      // useProfile is null if doc doesn't exist, or object.
      // If null, we might need to create one, or redirect to add-nic to create it.
      // Here we check if nic_last4 is missing.
      if (userProfile === null || !userProfile?.nic_last4) {
        router.replace("/(auth)/add-nic" as any);
      }
    }
  }, [user, isVerified, userProfile, initializing, router]);

  // Calculate proper bottom padding with safe area
  const bottomPadding = Math.max(
    insets.bottom,
    Platform.OS === "ios" ? 24 : 12
  );

  // GATING: If vault not initialized, force Recovery Flow
  if (user && isVerified && userProfile?.nic_last4 && !isVaultInitialized) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFF', paddingTop: insets.top }}>
        <RecoveryFlow onComplete={() => router.replace('/(tabs)' as any)} />
      </View>
    );
  }

  // GATING 2: If vault initialized but locked, show Unlock Screen
  if (user && isVerified && userProfile?.nic_last4 && isVaultInitialized && !isUnlocked) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', padding: 32 }}>
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(0, 196, 167, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
          <Lock size={40} color="#00C4A7" />
        </View>
        <Text style={{ fontSize: 24, fontFamily: Typography.fontFamily.bold, color: '#111827', marginBottom: 12 }}>Vault Locked</Text>
        <Text style={{ fontSize: 16, fontFamily: Typography.fontFamily.regular, color: '#6B7280', textAlign: 'center', marginBottom: 40, lineHeight: 24 }}>
          Your identity vault is secured with bank-grade encryption. Unlock with biometrics to continue.
        </Text>
        <TouchableOpacity
          style={{ backgroundColor: '#00C4A7', paddingVertical: 18, paddingHorizontal: 32, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%' }}
          onPress={unlockVault}
        >
          <Shield size={20} color="#FFF" />
          <Text style={{ color: '#FFF', fontSize: 17, fontFamily: Typography.fontFamily.bold, flex: 1, textAlign: 'center' }}>Unlock Secure Vault</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tint,
        tabBarInactiveTintColor: "#9CA3AF",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isLight ? "#FAFAFA" : "#0A0A0A",
          borderTopWidth: 0,
          elevation: 0,
          height: 72 + bottomPadding,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          paddingHorizontal: 16,
          // Soft shadow for floating effect
          shadowColor: "#000",
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
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={Home} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="cards"
        options={{
          title: "Wallet",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={CreditCard} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="passports"
        options={{
          title: "Passport",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={Globe} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="docs"
        options={{
          title: "Docs",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={FileText} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="me"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={User} color={color} focused={focused} />
          ),
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
    justifyContent: "center",
    alignItems: "center",
  },
});
