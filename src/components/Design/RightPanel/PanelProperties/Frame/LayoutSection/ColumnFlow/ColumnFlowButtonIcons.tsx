import { ReactNode } from 'react';
import { TFunction } from 'i18next';

// components
import Button from 'shared/UITools/Button/Button';
import { Icon, Tooltip } from 'shared';

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
      return [
        <Tooltip content={t(`${translationNameSpace}.wrapTooltip`)} key="wrap">
          <Button ariaLabel={t(`${translationNameSpace}.wrapAriaLabel`)} onClick={onWrapChange} selected={wrap}>
            <Icon name="Wrap" size={12} />
          </Button>
        </Tooltip>,
      ];
    case 'grid':
      return [
        <Tooltip content={t(`${translationNameSpace}.gridAutoPlacementTooltip`)} key="grid-auto-placement">
          <Button
            ariaLabel={t(`${translationNameSpace}.gridAutoPlacementAriaLabel`)}
            onClick={onGridAutoPlacementChange}
            selected={gridAutoPlacement}
            style={{ padding: 0 }}
          >
            <Icon name="FollowPath" size={24} />
          </Button>
        </Tooltip>,
      ];
    default:
      return [];
  }
};

export default ColumnFlowButtonIcons;
