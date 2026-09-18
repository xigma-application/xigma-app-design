import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Icon, Tooltip } from 'shared';

// others
import { translationNameSpace } from '../constants';

// styles
import styles from './contrast-unsupported.module.scss';

// types
import { TContrastUnsupportedReason } from '../types';

export type TContrastUnsupportedProps = { reason: TContrastUnsupportedReason };

export const ContrastUnsupported: FC<TContrastUnsupportedProps> = ({ reason }) => {
  const { t } = useTranslation();

  return (
    <Tooltip content={t(`${translationNameSpace}.unsupported.${reason}.tooltip`)}>
      <div className={styles.ContrastUnsupported}>
        <Icon color="neutral2" name="ContrastLocked" size={24} />
        <span>{t(`${translationNameSpace}.unsupported.${reason}.label`)}</span>
      </div>
    </Tooltip>
  );
};

export default ContrastUnsupported;
