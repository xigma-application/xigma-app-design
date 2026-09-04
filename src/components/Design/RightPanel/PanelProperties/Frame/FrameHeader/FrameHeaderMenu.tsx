import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { PopoverCompound } from 'shared';

// others
import { translationNameSpace } from './constants';

const { PopoverItem } = PopoverCompound;

const FrameHeaderMenu: FC = () => {
  const { t } = useTranslation();

  return <PopoverItem disabled label={t(`${translationNameSpace}.label`)} selected />;
};

export default FrameHeaderMenu;
