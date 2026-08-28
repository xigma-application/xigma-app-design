import { FC } from 'react';

// components
import Header from './Header/Header';

// styles
import styles from './file.module.scss';

// types
import { TFileProps } from './types';

const File: FC<TFileProps> = ({ name, onRenameFile }) => (
  <div className={styles.File}>
    <Header name={name} onRenameFile={onRenameFile} />
  </div>
);

export default File;
