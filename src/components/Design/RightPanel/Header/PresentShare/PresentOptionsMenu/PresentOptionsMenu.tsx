import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { PopoverCompound } from 'shared';

// hooks
import { useSelectPresentMode } from './hooks/useSelectPresentMode';

// others
import { KEYBOARD_SHORTCUTS } from '../../../../keys';
import { translationNameSpace } from './constants';

const { PopoverItem } = PopoverCompound;

const PresentOptionsMenu: FC = () => {
  const { t } = useTranslation();
  const { presentMode, selectPresentMode } = useSelectPresentMode();

  return (
    <>
      <PopoverItem
        icon="Play"
        label={t(`${translationNameSpace}.present`)}
        onClick={selectPresentMode('present')}
        selected={presentMode === 'present'}
        shortcut={KEYBOARD_SHORTCUTS.present.join('')}
      />
      <PopoverItem
        icon="PreviewPlay"
        label={t(`${translationNameSpace}.preview`)}
        onClick={selectPresentMode('preview')}
        selected={presentMode === 'preview'}
        shortcut={KEYBOARD_SHORTCUTS.preview.join('')}
      />
    </>
  );
};

export default PresentOptionsMenu;
