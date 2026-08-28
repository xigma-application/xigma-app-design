import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import FileMeta from './FileMeta/FileMeta';
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
      <div className={styles.Header__top}>
        <EditableInput
          action={
            <button aria-label={t(`${translationNameSpace}.menuAriaLabel`)} type="button">
              <Icon name="ChevronDown" size={12} />
            </button>
          }
          ariaLabel={t(`${translationNameSpace}.renameAriaLabel`)}
          className={styles.Header__name}
          onChange={onRenameFile}
          value={name}
        />
        <button aria-label={t(`${translationNameSpace}.collapseAriaLabel`)} className={styles.Header__collapse} type="button">
          <Icon name="CollapsePanel" size={24} />
        </button>
      </div>
      <FileMeta />
    </div>
  );
};

export default Header;
