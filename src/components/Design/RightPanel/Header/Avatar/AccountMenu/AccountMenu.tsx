import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import AvatarBadge from '../AvatarBadge/AvatarBadge';
import { Button, Icon } from 'shared';

// others
import { CURRENT_USER_NAME, translationNameSpace } from './constants';

// styles
import styles from './account-menu.module.scss';

const AccountMenu: FC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.AccountMenu}>
      <div className={styles.AccountMenu__user}>
        <AvatarBadge />
        <span className={styles['AccountMenu__user-name']}>{CURRENT_USER_NAME}</span>
      </div>

      <div className={styles.AccountMenu__actions}>
        <Button className={styles.AccountMenu__spotlight}>{t(`${translationNameSpace}.spotlightMe`)}</Button>
        <Button ariaLabel={t(`${translationNameSpace}.audioChat`)}>
          <Icon name="Headphones" size={16} />
        </Button>
      </div>
    </div>
  );
};

export default AccountMenu;
