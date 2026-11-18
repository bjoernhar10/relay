import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { Button } from '@/components/form/button';
import { SegmentedControl } from '@/components/form/segmented-control';
import { TextField } from '@/components/form/text-field';
import { ConnectionTest, type ConnectionTestState } from '@/components/settings/connection-test';
import {
  validateProviderDraft,
  type ProviderDraft,
  type ProviderDraftErrors,
} from '@/providers/provider-draft';
import { providerProtocols } from '@/providers/types';
import { makeStyles, useTheme } from '@/theme';

type ProviderFormProps = {
  initialDraft: ProviderDraft;
  hasStoredApiKey: boolean;
  onSave: (draft: ProviderDraft, options: { removeApiKey: boolean }) => Promise<void>;
  onDelete?: () => void;
  onTestConnection: (draft: ProviderDraft, options: { useStoredKey: boolean }) => Promise<number>;
};

export function ProviderForm({
  initialDraft,
  hasStoredApiKey,
  onSave,
  onDelete,
  onTestConnection,
}: ProviderFormProps) {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState(initialDraft);
  const [errors, setErrors] = useState<ProviderDraftErrors>({});
  const [removeApiKey, setRemoveApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [testState, setTestState] = useState<ConnectionTestState>({ status: 'idle' });

  const keyIsStored = hasStoredApiKey && !removeApiKey;

  const update = (changes: Partial<ProviderDraft>) =>
    setDraft((current) => ({ ...current, ...changes }));

  const isValid = () => {
    const validation = validateProviderDraft(draft);
    setErrors(validation);
    return Object.keys(validation).length === 0;
  };

  const testConnection = async () => {
    if (!isValid()) return;
    setTestState({ status: 'testing' });
    try {
      const modelCount = await onTestConnection(draft, { useStoredKey: keyIsStored });
      setTestState({ status: 'success', modelCount });
    } catch (error) {
      setTestState({ status: 'error', error });
    }
  };

  const save = async () => {
    if (!isValid()) return;

    setIsSaving(true);
    setSaveFailed(false);
    try {
      await onSave(draft, { removeApiKey });
    } catch {
      setSaveFailed(true);
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps="handled"
      bottomOffset={spacing.xl}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
    >
      <TextField
        label={t('providers.form.name')}
        value={draft.name}
        onChangeText={(name) => update({ name })}
        error={errors.name && t(`providers.form.errors.${errors.name}`)}
        returnKeyType="next"
      />
      <TextField
        label={t('providers.form.baseUrl')}
        value={draft.baseUrl}
        onChangeText={(baseUrl) => update({ baseUrl })}
        error={errors.baseUrl && t(`providers.form.errors.${errors.baseUrl}`)}
        keyboardType="url"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <SegmentedControl
        label={t('providers.form.protocol')}
        options={providerProtocols.map((protocol) => ({
          value: protocol,
          label: t(`providers.protocols.${protocol}`),
        }))}
        value={draft.protocol}
        onChange={(protocol) => update({ protocol })}
      />
      <View style={styles.keySection}>
        <TextField
          label={t('providers.form.apiKey')}
          value={draft.apiKey}
          onChangeText={(apiKey) => update({ apiKey })}
          placeholder={
            keyIsStored ? t('providers.form.apiKeyStored') : t('providers.form.apiKeyPlaceholder')
          }
          hint={
            removeApiKey ? t('providers.form.apiKeyWillBeRemoved') : t('providers.form.apiKeyHint')
          }
          editable={!removeApiKey}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="password"
        />
        {hasStoredApiKey ? (
          <View style={styles.inlineAction}>
            <Button
              variant="plain"
              label={
                removeApiKey ? t('providers.form.keepApiKey') : t('providers.form.removeApiKey')
              }
              onPress={() => {
                setRemoveApiKey((current) => !current);
                update({ apiKey: '' });
              }}
            />
          </View>
        ) : null}
        <ConnectionTest state={testState} onTest={() => void testConnection()} />
      </View>
      {saveFailed ? (
        <AppText color="danger" accessibilityRole="alert">
          {t('providers.form.saveFailed')}
        </AppText>
      ) : null}
      <View style={styles.actions}>
        <Button label={t('providers.form.save')} onPress={() => void save()} disabled={isSaving} />
        {onDelete ? (
          <Button variant="destructive" label={t('providers.form.delete')} onPress={onDelete} />
        ) : null}
      </View>
    </KeyboardAwareScrollView>
  );
}

const useStyles = makeStyles(({ spacing }) => ({
  content: {
    gap: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  keySection: {
    gap: spacing.xs,
  },
  inlineAction: {
    alignItems: 'flex-start',
  },
  actions: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
}));
