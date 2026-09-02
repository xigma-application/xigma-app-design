import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import FileMeta from './FileMeta/FileMeta';
import FileNameMenu from './FileNameMenu/FileNameMenu';
import MinimizeUiButton from './MinimizeUiButton/MinimizeUiButton';
import { EditableInput } from 'shared';

// hooks
import { useFileNameMenu } from './hooks/useFileNameMenu';

// others
import { translationNameSpace } from '../constants';

// styles
import styles from './header.module.scss';

// types
import { THeaderProps } from './types';

const Header: FC<THeaderProps> = ({ name, onRenameFile }) => {
  const { t } = useTranslation();
  const { isOpen, onOpenChange } = useFileNameMenu();

  return (
    <div className={styles.Header}>
      <div className={styles.Header__top}>
        <EditableInput
          action={<FileNameMenu onOpenChange={onOpenChange} open={isOpen} />}
          actionOpen={isOpen}
          ariaLabel={t(`${translationNameSpace}.renameAriaLabel`)}
          className={styles.Header__name}
          onActionOpenChange={onOpenChange}
          onChange={onRenameFile}
          value={name}
        />
        <MinimizeUiButton />
      </div>
      <FileMeta />
    </div>
  );
};

export default Header;
