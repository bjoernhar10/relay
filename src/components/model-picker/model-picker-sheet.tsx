import { BottomSheetTextInput, type BottomSheetModal } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { useState, type RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { SearchField } from '@/components/search-field';
import { Sheet } from '@/components/sheet';
import { useModelStore } from '@/store/model-store';
import { layout, makeStyles } from '@/theme';

import { dummyFavoriteModelIds, dummyModels, dummyProviders } from './dummy-models';
import { ModelPickerList } from './model-picker-list';
import { buildModelSections } from './model-sections';

type ModelPickerSheetProps = {
  ref: RefObject<BottomSheetModal | null>;
};

export function ModelPickerSheet({ ref }: ModelPickerSheetProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const [query, setQuery] = useState('');
  const selectedModelId = useModelStore((state) => state.selectedModelId);
  const selectModel = useModelStore((state) => state.selectModel);

  const sections = buildModelSections(
    { providers: dummyProviders, models: dummyModels, favoriteModelIds: dummyFavoriteModelIds },
    query,
  );

  const select = (modelId: string) => {
    void Haptics.selectionAsync();
    selectModel(modelId);
    ref.current?.dismiss();
  };

  return (
    <Sheet
      ref={ref}
      snapPoint={layout.tallSheetSnapPoint}
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      onDismiss={() => setQuery('')}
    >
      <View style={styles.search}>
        <SearchField
          placeholder={t('modelPicker.search')}
          value={query}
          onChangeText={setQuery}
          InputComponent={BottomSheetTextInput}
        />
      </View>
      <ModelPickerList
        sections={sections}
        providers={dummyProviders}
        selectedModelId={selectedModelId}
        onSelect={select}
      />
    </Sheet>
  );
}

const useStyles = makeStyles(({ spacing }) => ({
  search: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
  },
}));
