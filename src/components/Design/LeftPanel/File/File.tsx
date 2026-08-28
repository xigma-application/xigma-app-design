import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

// components
import FileMeta from './FileMeta/FileMeta';
import Header from './Header/Header';

// others
import { DEFAULT_FILE_NAME_KEY } from './constants';

// styles
import styles from './file.module.scss';

const File: FC = () => {
  const { t } = useTranslation();
  const [name, setName] = useState(() => t(DEFAULT_FILE_NAME_KEY));

  return (
    <div className={styles.File}>
      <Header name={name} onRenameFile={setName} />
      <FileMeta />
    </div>
  );
};

export default File;
