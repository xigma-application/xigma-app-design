import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { UITools } from 'shared';

// others
import { translationNameSpace } from '../../constants';

// types
import { GapMode } from 'types/design/enums';

const { PopoverItem, PopoverSeparator } = UITools.PopoverCompound;

export type TColumnGapModeMenuProps = {
  canAuto: boolean;
  mode: GapMode;
  onSelectAuto: TFunc;
  onSelectFixed: TFunc;
  value: number;
};

export const ColumnGapModeMenu: FC<TColumnGapModeMenuProps> = ({ canAuto, mode, onSelectAuto, onSelectFixed, value }) => {
  const { t } = useTranslation();

  return (
    <>
      <PopoverItem label={String(Math.round(value))} onClick={onSelectFixed} selected={mode === GapMode.fixed} />
      {canAuto && (
        <PopoverItem label={t(`${translationNameSpace}.gapModeToggleLabel`)} onClick={onSelectAuto} selected={mode === GapMode.auto} />
      )}
      <PopoverSeparator />
      <PopoverItem icon="Variables" iconSize={12} label={t(`${translationNameSpace}.applyVariable`)} />
    </>
  );
};

export default ColumnGapModeMenu;
