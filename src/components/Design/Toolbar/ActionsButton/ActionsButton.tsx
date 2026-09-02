import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Button, Icon, Tooltip } from 'shared';

// others
import { KEYBOARD_SHORTCUTS } from '../../keys';
import { translationNameSpace } from '../constants';

// styles
import styles from './actions-button.module.scss';

const ActionsButton: FC = () => {
  const { t } = useTranslation();
  const label = t(`${translationNameSpace}.actions`);
  const shortcut = KEYBOARD_SHORTCUTS.openActions.join('');

  return (
    <Tooltip
      content={
        <>
          {label}
          <span className={styles.ActionsButton__shortcut}>{shortcut}</span>
        </>
      }
    >
      <Button ariaLabel={label} className={styles.ActionsButton}>
        <Icon color="neutral1" name="Actions" size={24} />
      </Button>
    </Tooltip>
  );
};

export default ActionsButton;
