import { ReactNode } from 'react';
import { TFunction } from 'i18next';

// components
import { Tooltip, UITools } from 'shared';

// others
import { translationNameSpace } from './constants';

export const ColumnDimensionsButtonIcons = (locked: boolean, lockDisabled: boolean, onToggleLock: TFunc, t: TFunction): ReactNode[] => [
  <Tooltip content={t(`${translationNameSpace}.${locked ? 'unlockTooltip' : 'lockTooltip'}`)} key="lock-aspect-ratio">
    <UITools.ButtonIcon
      ariaLabel={t(`${translationNameSpace}.${locked ? 'unlockAriaLabel' : 'lockAriaLabel'}`)}
      disabled={lockDisabled}
      name="AspectRatio"
      onClick={onToggleLock}
      selected={locked}
    />
  </Tooltip>,
];

export default ColumnDimensionsButtonIcons;
