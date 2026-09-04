import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import AccountMenu from './AccountMenu/AccountMenu';
import AvatarBadge from './AvatarBadge/AvatarBadge';
import { ButtonMenu, Icon, Tooltip } from 'shared';

// others
import { translationNameSpace } from './constants';

// styles
import styles from './avatar.module.scss';

const Avatar: FC = () => {
  const { t } = useTranslation();

  return (
    <ButtonMenu
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
    </ButtonMenu>
  );
};

export default Avatar;
