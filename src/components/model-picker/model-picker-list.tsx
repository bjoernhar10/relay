import { BottomSheetSectionList } from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppText } from '@/components/app-text';
import { isSameModel, type ModelRef } from '@/store/model-store';
import { makeStyles } from '@/theme';

import { AddModelRow } from './add-model-row';
import { ModelRow } from './model-row';
import type { ModelSection, PickerModel } from './model-sections';
import { ProviderStatusRow } from './provider-status-row';

type ModelPickerListProps = {
  sections: ModelSection[];
  selected: ModelRef | null;
  isSearching: boolean;
  onSelect: (model: PickerModel) => void;
  onToggleFavorite: (model: PickerModel) => void;
  onAddModel: (model: ModelRef) => void;
  onRetry: (providerId: string) => void;
};

export function ModelPickerList({
  sections,
  selected,
  isSearching,
  onSelect,
  onToggleFavorite,
  onAddModel,
  onRetry,
}: ModelPickerListProps) {
  const { t } = useTranslation();
  const styles = useStyles();

  return (
    <BottomSheetSectionList
      sections={sections}
      keyExtractor={(model) => `${model.providerId}::${model.modelId}`}
      renderSectionHeader={({ section }) => (
        <AppText variant="captionStrong" color="textTertiary" style={styles.sectionHeader}>
          {section.kind === 'favorites' ? t('modelPicker.favorites') : section.title}
        </AppText>
      )}
      renderItem={({ item, section }) => (
        <ModelRow
          label={item.label}
          caption={
            section.kind === 'favorites'
              ? item.providerName
              : item.isManual
                ? t('modelPicker.manual')
                : undefined
          }
          selected={selected !== null && isSameModel(item, selected)}
          isFavorite={item.isFavorite}
          onPress={() => onSelect(item)}
          onToggleFavorite={() => onToggleFavorite(item)}
        />
      )}
      renderSectionFooter={({ section }) =>
        section.kind === 'provider' && !isSearching ? (
          <View>
            <ProviderStatusRow
              status={section.status}
              error={section.error}
              isEmpty={section.data.length === 0}
              onRetry={() => onRetry(section.providerId)}
            />
            <AddModelRow
              providerName={section.title}
              onAdd={(modelId) => onAddModel({ providerId: section.providerId, modelId })}
            />
          </View>
        ) : null
      }
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
