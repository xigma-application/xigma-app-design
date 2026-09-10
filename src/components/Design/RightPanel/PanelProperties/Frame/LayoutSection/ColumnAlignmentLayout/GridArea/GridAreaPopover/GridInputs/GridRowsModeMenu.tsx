import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { UITools } from 'shared';

// others
import { translationNameSpace } from '../../../constants';

const { PopoverItem } = UITools.PopoverCompound;

export type TGridRowsModeMenuProps = {
  isAuto: boolean;
  onSetAuto: TFunc;
  onSetFixed: TFunc;
  value: string;
};

export const GridRowsModeMenu: FC<TGridRowsModeMenuProps> = ({ isAuto, onSetAuto, onSetFixed, value }) => {
  const { t } = useTranslation();

  return (
    <>
      <PopoverItem label={value} onClick={onSetFixed} selected={!isAuto} />
      <PopoverItem label={t(`${translationNameSpace}.grid.rowsAuto`)} onClick={onSetAuto} selected={isAuto} />
    </>
  );
};

export default GridRowsModeMenu;
