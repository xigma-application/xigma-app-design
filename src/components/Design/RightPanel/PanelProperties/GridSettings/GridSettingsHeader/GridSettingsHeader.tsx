import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { UITools } from 'shared';

// others
import { translationNameSpace } from '../constants';

export type TGridSettingsHeaderProps = {
  onClose: TFunc;
};

export const GridSettingsHeader: FC<TGridSettingsHeaderProps> = ({ onClose }) => {
  const { t } = useTranslation();

  return (
    <UITools.ComponentHeader
      buttons={<UITools.ButtonIcon ariaLabel={t(`${translationNameSpace}.closeAriaLabel`)} name="Close" onClick={onClose} />}
      e2eValue="grid-settings-header"
    >
      {t(`${translationNameSpace}.title`)}
    </UITools.ComponentHeader>
  );
};

export default GridSettingsHeader;
