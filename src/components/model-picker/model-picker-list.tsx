import { BottomSheetSectionList } from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/app-text';
import { makeStyles } from '@/theme';

import type { ModelProvider } from './model';
import { ModelRow } from './model-row';
import type { ModelSection } from './model-sections';

type ModelPickerListProps = {
  sections: ModelSection[];
  providers: ModelProvider[];
  selectedModelId: string;
  onSelect: (modelId: string) => void;
};

export function ModelPickerList({
  sections,
  providers,
  selectedModelId,
  onSelect,
}: ModelPickerListProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const providerName = (providerId: string) =>
    providers.find((provider) => provider.id === providerId)?.name;

  return (
    <BottomSheetSectionList
      sections={sections}
      keyExtractor={(model) => model.id}
      renderSectionHeader={({ section }) => (
        <AppText variant="captionStrong" color="textTertiary" style={styles.sectionHeader}>
          {section.kind === 'favorites' ? t('modelPicker.favorites') : section.title}
        </AppText>
      )}
      renderItem={({ item, section }) => (
        <ModelRow
          label={item.label}
          providerName={section.kind === 'favorites' ? providerName(item.providerId) : undefined}
          selected={item.id === selectedModelId}
          onPress={() => onSelect(item.id)}
        />
      )}
      ListEmptyComponent={
        <AppText color="textSecondary" style={styles.empty}>
          {t('modelPicker.noResults')}
        </AppText>
      }
      stickySectionHeadersEnabled={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.content}
    />
  );
}

const useStyles = makeStyles(({ spacing }) => ({
  content: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  sectionHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
  },
  empty: {
    textAlign: 'center',
    paddingTop: spacing.xl,
  },
}));
