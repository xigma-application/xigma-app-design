import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Icon, Tooltip } from 'shared';

// hooks
import { useToggleUiMinimized } from './hooks/useToggleUiMinimized';

// others
import { KEYBOARD_SHORTCUTS } from 'components/Design/keys';
import { translationNameSpace } from '../../constants';

// store
import { selectIsUiMinimized } from 'store/design/selectors';
import { useAppSelector } from 'store';

// styles
import styles from './minimize-ui-button.module.scss';

const MinimizeUiButton: FC = () => {
  const { t } = useTranslation();
  const isUiMinimized = useAppSelector(selectIsUiMinimized);
  const handleClick = useToggleUiMinimized();
  const label = t(isUiMinimized ? `${translationNameSpace}.expandUiLabel` : `${translationNameSpace}.minimizeUiLabel`);
  const shortcut = KEYBOARD_SHORTCUTS.toggleUiMinimized.join('');

  return (
    <Tooltip
      content={
        <>
          {label}
          <span className={styles.MinimizeUiButton__shortcut}>{shortcut}</span>
        </>
      }
    >
      <button aria-label={label} className={styles.MinimizeUiButton} onClick={handleClick} type="button">
        <Icon name="CollapsePanel" size={24} />
      </button>
    </Tooltip>
  );
};

export default MinimizeUiButton;
