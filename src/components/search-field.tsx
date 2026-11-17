import type { ComponentType } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';

import { Icon } from '@/components/icon';
import { makeStyles, useTheme } from '@/theme';

type SearchFieldProps = Pick<TextInputProps, 'value' | 'onChangeText'> & {
  placeholder: string;
  // Bottom sheets need their own input component to coordinate with the keyboard.
  InputComponent?: ComponentType<TextInputProps>;
};

export function SearchField({
  placeholder,
  value,
  onChangeText,
  InputComponent = TextInput,
}: SearchFieldProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.container}>
      <Icon name="search" size="sm" color="textTertiary" />
      <InputComponent
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        accessibilityLabel={placeholder}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="while-editing"
      />
    </View>
  );
}

const useStyles = makeStyles(({ colors, spacing, radii, sizes, typography }) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: sizes.touchTarget,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    fontSize: typography.body.fontSize,
    color: colors.textPrimary,
  },
}));
