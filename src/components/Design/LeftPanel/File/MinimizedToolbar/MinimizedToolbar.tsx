import cx from 'classnames';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// @xigma
import XigmaLogoShape from '@xigma/assets/xigma-logo-shape.svg?react';

// components
import MinimizeUiButton from '../Header/MinimizeUiButton/MinimizeUiButton';
import { Chip, Tooltip } from 'shared';

// hooks
import { useExpandUi } from './hooks/useExpandUi';

// others
import { KEYBOARD_SHORTCUTS } from 'components/Design/keys';
import { translationNameSpace } from '../constants';

// store
import { selectAreRulersVisible } from 'store/design/selectors';
import { useAppSelector } from 'store';

// styles
import styles from './minimized-toolbar.module.scss';

// types
import { TMinimizedToolbarProps } from './types';

const MinimizedToolbar: FC<TMinimizedToolbarProps> = ({ name }) => {
  const { t } = useTranslation();
  const { handleClick: handleExpand, handleKeyDown } = useExpandUi();
  const areRulersVisible = useAppSelector(selectAreRulersVisible);

  return (
    <div className={cx(styles.MinimizedToolbar, { [styles['MinimizedToolbar--withRulers']]: areRulersVisible })}>
      <button aria-label="xigma" className={styles.MinimizedToolbar__logo} type="button">
        <XigmaLogoShape />
      </button>
      <Tooltip
        content={
          <>
            {t(`${translationNameSpace}.expandUiLabel`)}
            <span className={styles.MinimizedToolbar__shortcut}>{KEYBOARD_SHORTCUTS.toggleUiMinimized.join('')}</span>
          </>
        }
      >
        <div
          aria-label={name}
          className={styles.MinimizedToolbar__content}
          onClick={handleExpand}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={0}
        >
          <span className={styles.MinimizedToolbar__title}>{name}</span>
          <Chip variant="free">{t(`${translationNameSpace}.subscription.free`)}</Chip>
          <MinimizeUiButton className={styles.MinimizedToolbar__button} withTooltip={false} />
        </div>
      </Tooltip>
    </div>
  );
};

export default MinimizedToolbar;
