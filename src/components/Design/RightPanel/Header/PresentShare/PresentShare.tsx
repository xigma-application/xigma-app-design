import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import PresentOptionsMenu from './PresentOptionsMenu/PresentOptionsMenu';
import { Button, ButtonMenu, Icon, Tooltip } from 'shared';

// others
import { KEYBOARD_SHORTCUTS } from '../../../keys';
import { translationNameSpace } from './constants';

// styles
import styles from './present-share.module.scss';

const PresentShare: FC = () => {
  const { t } = useTranslation();
  const presentShortcut = KEYBOARD_SHORTCUTS.present.join('');

  return (
    <div className={styles.PresentShare}>
      <div className={styles.PresentShare__group}>
        <Tooltip
          content={
            <>
              {t(`${translationNameSpace}.present`)}
              <span className={styles.PresentShare__shortcut}>{presentShortcut}</span>
            </>
          }
        >
          <Button ariaLabel={t(`${translationNameSpace}.present`)} className={styles.PresentShare__present}>
            <Icon name="Play" size={24} />
          </Button>
        </Tooltip>
        <ButtonMenu
          align="end"
          className={styles['PresentShare__present-options']}
          sideOffset={-2}
          trigger={<Icon name="ChevronDown" size={16} />}
          triggerAriaLabel={t(`${translationNameSpace}.presentOptions`)}
        >
          <PresentOptionsMenu />
        </ButtonMenu>
      </div>
      <Button className={styles.PresentShare__share} size="medium">
        {t(`${translationNameSpace}.share`)}
      </Button>
    </div>
  );
};

export default PresentShare;
