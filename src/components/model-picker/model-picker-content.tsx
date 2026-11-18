import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { SearchField } from '@/components/search-field';
import { useModelStore } from '@/store/model-store';
import { makeStyles } from '@/theme';

import { ModelPickerList } from './model-picker-list';
import { buildModelSections, type PickerModel } from './model-sections';
import { NoProviders } from './no-providers';
import { useProviderModels } from './use-provider-models';

type ModelPickerContentProps = {
  query: string;
  onQueryChange: (query: string) => void;
  onSelected: () => void;
  onSetUpProvider: () => void;
};

// Rendered inside the sheet, so model lists are only fetched once the picker opens.
export function ModelPickerContent({
  query,
  onQueryChange,
  onSelected,
  onSetUpProvider,
}: ModelPickerContentProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const providerModels = useProviderModels();
  const { selected, favorites, manualModels, selectModel, toggleFavorite, addManualModel } =
    useModelStore();

  if (providerModels.length === 0) return <NoProviders onSetUp={onSetUpProvider} />;

  const sections = buildModelSections(
    {
      providers: providerModels.map(({ provider, status, error, models }) => ({
        providerId: provider.id,
        providerName: provider.name,
        status,
        error,
        models,
      })),
      manualModels,
      favorites,
    },
    query,
  );

  const select = (model: PickerModel) => {
    void Haptics.selectionAsync();
    selectModel({ providerId: model.providerId, modelId: model.modelId, label: model.label });
    onSelected();
  };

  const toggle = (model: PickerModel) => {
    void Haptics.selectionAsync();
    toggleFavorite({ providerId: model.providerId, modelId: model.modelId });
  };

  return (
    <>
      <View style={styles.search}>
        <SearchField
          placeholder={t('modelPicker.search')}
          value={query}
          onChangeText={onQueryChange}
          InputComponent={BottomSheetTextInput}
        />
      </View>
      <ModelPickerList
        sections={sections}
        selected={selected}
        isSearching={query.trim().length > 0}
        onSelect={select}
        onToggleFavorite={toggle}
        onAddModel={addManualModel}
        onRetry={(providerId) =>
          providerModels.find(({ provider }) => provider.id === providerId)?.retry()
        }
      />
    </>
  );
}

const useStyles = makeStyles(({ spacing }) => ({
  search: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
  },
}));
