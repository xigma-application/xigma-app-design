import { useTranslation } from 'react-i18next';

// components
import FramePresetRow from '../FramePresetRow/FramePresetRow';

// others
import { FRAME_PRESET_GROUPS } from '../../framePresetGroups';
import { translationNameSpace } from '../constants';

// types
import { TAccordionItem } from 'shared/UITools/Accordion/types';

export const useFramePresetAccordionItems = (): TAccordionItem[] => {
  const { t } = useTranslation();

  return FRAME_PRESET_GROUPS.map((group) => ({
    content: group.presets.map((preset) => <FramePresetRow key={preset.label} preset={preset} />),
    defaultExpanded: false,
    label: t(`${translationNameSpace}.groups.${group.labelKey}`),
  }));
};
