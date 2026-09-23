import { ReactNode } from 'react';
import { TFunction } from 'i18next';

// components
import { Tooltip, UITools } from 'shared';

// others
import { translationNameSpace } from './constants';

export const ColumnFlowButtonIcons = (
  value: string,
  wrap: boolean,
  onWrapChange: TFunc,
  t: TFunction,
  gridAutoPlacement: boolean,
  onGridAutoPlacementChange: TFunc,
): ReactNode[] => {
  switch (value) {
    case 'horizontal':
    case 'vertical':
      return [
        <Tooltip content={t(`${translationNameSpace}.wrapTooltip`)} key="wrap">
          <UITools.ButtonIcon ariaLabel={t(`${translationNameSpace}.wrapAriaLabel`)} name="Wrap" onClick={onWrapChange} selected={wrap} />
        </Tooltip>,
      ];
    case 'grid':
      return [
        <Tooltip content={t(`${translationNameSpace}.gridAutoPlacementTooltip`)} key="grid-auto-placement">
          <UITools.ButtonIcon
            ariaLabel={t(`${translationNameSpace}.gridAutoPlacementAriaLabel`)}
            name="FollowPath"
            onClick={onGridAutoPlacementChange}
            selected={gridAutoPlacement}
          />
        </Tooltip>,
      ];
    default:
      return [];
  }
};

export default ColumnFlowButtonIcons;
