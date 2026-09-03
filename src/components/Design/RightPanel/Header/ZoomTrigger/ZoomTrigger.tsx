import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ZoomMenu from '../ZoomMenu/ZoomMenu';
import { ButtonMenu, Icon } from 'shared';

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
    <ButtonMenu
      align="end"
      className={styles.ZoomTrigger}
      trigger={
        <span className={styles.ZoomTrigger__label}>
          {zoomPercentage}%<Icon name="ChevronDown" size={16} />
        </span>
      }
      triggerAriaLabel={t(`${translationNameSpace}.ariaLabel`)}
    >
      <ZoomMenu />
    </ButtonMenu>
  );
};

export default ZoomTrigger;
