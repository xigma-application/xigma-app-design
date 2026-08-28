import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// @xigma
import XigmaLogoShape from '@xigma/assets/xigma-logo-shape.svg?react';

// components
import MinimizeUiButton from '../Header/MinimizeUiButton/MinimizeUiButton';
import { Chip } from 'shared';

// hooks
import { useToggleUiMinimized } from '../Header/MinimizeUiButton/hooks/useToggleUiMinimized';

// others
import { translationNameSpace } from '../constants';

// styles
import styles from './minimized-toolbar.module.scss';

// types
import { TMinimizedToolbarProps } from './types';

const MinimizedToolbar: FC<TMinimizedToolbarProps> = ({ name }) => {
  const { t } = useTranslation();
  const handleExpand = useToggleUiMinimized();

  return (
    <div className={styles.MinimizedToolbar}>
      <button aria-label="xigma" className={styles.MinimizedToolbar__logo} type="button">
        <XigmaLogoShape />
      </button>
      <div className={styles.MinimizedToolbar__content}>
        <button className={styles.MinimizedToolbar__title} onClick={handleExpand} type="button">
          {name}
        </button>
        <Chip variant="free">{t(`${translationNameSpace}.subscription.free`)}</Chip>
        <MinimizeUiButton />
      </div>
    </div>
  );
};

export default MinimizedToolbar;
