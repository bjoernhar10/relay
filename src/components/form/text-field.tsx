import { TextInput, View, type TextInputProps } from 'react-native';

import { AppText } from '@/components/app-text';
import { makeStyles, useTheme } from '@/theme';

type TextFieldProps = Omit<TextInputProps, 'style' | 'placeholderTextColor'> & {
  label: string;
  error?: string;
  hint?: string;
};

export function TextField({ label, error, hint, editable = true, ...inputProps }: TextFieldProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.field}>
      <AppText variant="captionStrong" color="textSecondary">
        {label}
      </AppText>
      <TextInput
        {...inputProps}
        editable={editable}
        accessibilityLabel={label}
        placeholderTextColor={colors.textTertiary}
        style={[styles.input, error ? styles.inputError : null, !editable && styles.disabled]}
      />
      {error ? (
        <AppText variant="caption" color="danger">
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="caption" color="textTertiary">
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles(({ colors, spacing, radii, sizes, typography, opacity }) => ({
  field: {
    gap: spacing.xs,
  },
  input: {
    ...typography.body,
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
  },
  inputError: {
    borderColor: colors.danger,
  },
  disabled: {
    opacity: opacity.dimmed,
  },
}));
