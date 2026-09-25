import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { UITools } from 'shared';

// hooks
import { useConvertSelectionToFrame } from 'components/Design/Menu/hooks/useConvertSelectionToFrame';

// others
import { translationNameSpace } from './constants';

const { PopoverItem } = UITools.PopoverCompound;

const SectionHeaderMenu: FC = () => {
  const { t } = useTranslation();
  const onConvertToFrame = useConvertSelectionToFrame();

  return (
    <Fragment>
      <PopoverItem label={t(`${translationNameSpace}.label`)} selected />
      <PopoverItem label={t(`${translationNameSpace}.typeMenu.frame`)} onClick={onConvertToFrame} />
      <PopoverItem disabled label={t(`${translationNameSpace}.typeMenu.group`)} />
    </Fragment>
  );
};

export default SectionHeaderMenu;
