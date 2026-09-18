import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Tooltip, UITools } from 'shared';

// others
import { translationNameSpace } from '../../../../constants';

// styles
import styles from './stroke-settings-panel-header.module.scss';

export type TStrokeSettingsPanelHeaderProps = {
  onClose: TFunc;
};

export const StrokeSettingsPanelHeader: FC<TStrokeSettingsPanelHeaderProps> = ({ onClose }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.StrokeSettingsPanelHeader}>
      <span className={styles.StrokeSettingsPanelHeader__title}>{t(`${translationNameSpace}.settings.title`)}</span>
      <Tooltip content={t('common.close')}>
        <UITools.ButtonIcon
          ariaLabel={t('common.close')}
          className={styles.StrokeSettingsPanelHeader__close}
          name="Close"
          onClick={onClose}
        />
      </Tooltip>
    </div>
  );
};

export default StrokeSettingsPanelHeader;
