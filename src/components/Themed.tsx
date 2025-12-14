import { Colors } from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
import { Text as DefaultText, View as DefaultView } from "react-native";

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
  [key: string]: any;
};

export type TextProps = ThemeProps & DefaultText["props"];
export type ViewProps = ThemeProps & DefaultView["props"];

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light
): string {
  const { colors, theme } = useTheme();
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  }

  // Fallback to theme colors
  return colors[colorName] as string;
}

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const { colors } = useTheme();
  const color =
    useThemeColor({ light: lightColor, dark: darkColor }, "text") ||
    colors.text;

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const { colors } = useTheme();
  const backgroundColor =
    useThemeColor({ light: lightColor, dark: darkColor }, "background") ||
    colors.background;

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}
