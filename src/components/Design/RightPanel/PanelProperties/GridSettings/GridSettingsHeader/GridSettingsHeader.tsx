import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// @xigma
import { Icon } from '@xigma/components';

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
      buttons={
        <UITools.Button ariaLabel={t(`${translationNameSpace}.closeAriaLabel`)} onClick={onClose} style={{ padding: 0 }}>
          <Icon name="Close" size={16} />
        </UITools.Button>
      }
      e2eValue="grid-settings-header"
    >
      {t(`${translationNameSpace}.title`)}
    </UITools.ComponentHeader>
  );
};

export default GridSettingsHeader;
