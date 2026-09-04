import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import AccountMenu from './AccountMenu/AccountMenu';
import AvatarBadge from './AvatarBadge/AvatarBadge';
import { Icon, Tooltip, UITools } from 'shared';

// others
import { translationNameSpace } from './constants';

// styles
import styles from './avatar.module.scss';

const Avatar: FC = () => {
  const { t } = useTranslation();

  return (
    <UITools.ButtonMenu
      align="center"
      className={styles.Avatar}
      trigger={
        <Tooltip content={t(`${translationNameSpace}.multiplayerTools`)}>
          <span className={styles.Avatar__trigger}>
            <AvatarBadge />
            <Icon name="ChevronDown" size={16} />
          </span>
        </Tooltip>
      }
      triggerAriaLabel={t(`${translationNameSpace}.ariaLabel`)}
    >
      <AccountMenu />
    </UITools.ButtonMenu>
  );
};

export default Avatar;
