import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ZoomMenu from '../ZoomMenu/ZoomMenu';
import { Icon, Tooltip, UITools } from 'shared';

// others
import { translationNameSpace } from './constants';

// store
import { selectViewport } from 'store/design/selectors';
import { useAppSelector } from 'store';

// styles
import styles from './zoom-trigger.module.scss';

const ZoomTrigger: FC = () => {
  const { t } = useTranslation();
  const viewport = useAppSelector(selectViewport);
  const zoomPercentage = Math.round(viewport.zoom * 100);

  return (
    <UITools.ButtonMenu
      align="end"
      className={styles.ZoomTrigger}
      trigger={
        <Tooltip content={t(`${translationNameSpace}.tooltip`)}>
          <span className={styles.ZoomTrigger__label}>
            {zoomPercentage}%<Icon name="ChevronDown" size={16} />
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
