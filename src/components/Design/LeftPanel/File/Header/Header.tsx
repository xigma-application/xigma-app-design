import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { EditableInput, Icon } from 'shared';

// others
import { translationNameSpace } from '../constants';

// styles
import styles from './header.module.scss';

// types
import { THeaderProps } from './types';

const Header: FC<THeaderProps> = ({ name, onRenameFile }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.Header}>
      <EditableInput
        action={
          <button aria-label={t(`${translationNameSpace}.menuAriaLabel`)} className={styles.Header__menu} type="button">
            <Icon name="ChevronDown" size={12} />
          </button>
        }
        ariaLabel={t(`${translationNameSpace}.renameAriaLabel`)}
        className={styles.Header__name}
        onChange={onRenameFile}
        value={name}
      />
      <button aria-label={t(`${translationNameSpace}.collapseAriaLabel`)} className={styles.Header__collapse} type="button">
        <Icon name="PanelLeft" size={24} />
      </button>
    </div>
  );
};

export default Header;
