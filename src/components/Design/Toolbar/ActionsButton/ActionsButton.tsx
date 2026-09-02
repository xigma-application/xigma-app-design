import * as PopoverPrimitive from '@radix-ui/react-popover';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Icon, Tooltip } from 'shared';

// others
import { KEYBOARD_SHORTCUTS } from '../../keys';
import { translationNameSpace } from '../constants';

// store
import { selectIsActionsPanelOpen } from 'store/design/selectors';
import { useAppSelector } from 'store';

// styles
import styles from './actions-button.module.scss';

const ActionsButton: FC = () => {
  const { t } = useTranslation();
  const isOpen = useAppSelector(selectIsActionsPanelOpen);
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
      <span className={styles.ActionsButton__trigger}>
        <PopoverPrimitive.Trigger aria-label={label} className={styles.ActionsButton}>
          <Icon color={isOpen ? 'onBlue1' : 'neutral1'} name="Actions" size={24} />
        </PopoverPrimitive.Trigger>
      </span>
    </Tooltip>
  );
};

export default ActionsButton;
