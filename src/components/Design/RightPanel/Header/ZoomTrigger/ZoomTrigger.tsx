import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ZoomMenu from '../ZoomMenu/ZoomMenu';
import { Icon, Tooltip, UITools } from 'shared';

// others
import { translationNameSpace } from './constants';

// store
import { selectZoom } from 'store/design/selectors';
import { useAppSelector } from 'store';

// styles
import styles from './zoom-trigger.module.scss';

const ZoomTrigger: FC = () => {
  const { t } = useTranslation();
  const zoom = useAppSelector(selectZoom);
  const zoomPercentage = Math.round(zoom * 100);

  return (
    <UITools.ButtonMenu
      align="end"
      className={styles.ZoomTrigger}
      trigger={
        <Tooltip content={t(`${translationNameSpace}.tooltip`)}>
          <span className={styles.ZoomTrigger__label}>
            {zoomPercentage}%
            <div className={styles.ZoomTrigger__icon}>
              <Icon name="ChevronDown" size={24} />
            </div>
          </span>
        </Tooltip>
      }
      triggerAriaLabel={t(`${translationNameSpace}.ariaLabel`)}
    >
      <ZoomMenu />
    </UITools.ButtonMenu>
  );
};

export default ZoomTrigger;
