import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import AccountMenu from './AccountMenu/AccountMenu';
import AvatarBadge from './AvatarBadge/AvatarBadge';
import { ButtonMenu, Icon } from 'shared';

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
        <>
          <AvatarBadge />
          <Icon name="ChevronDown" size={16} />
        </>
      }
      triggerAriaLabel={t(`${translationNameSpace}.ariaLabel`)}
    >
      <AccountMenu />
    </ButtonMenu>
  );
};

export default Avatar;
