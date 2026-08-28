import { FC } from 'react';

// components
import Header from './Header/Header';
import Pages from './Pages/Pages';

// styles
import styles from './file.module.scss';

// types
import { TFileProps } from './types';

const File: FC<TFileProps> = ({ name, onRenameFile }) => (
  <div className={styles.File}>
    <Header name={name} onRenameFile={onRenameFile} />
    <Pages />
  </div>
);

export default File;
