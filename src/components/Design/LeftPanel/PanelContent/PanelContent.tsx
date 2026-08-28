import { FC } from 'react';

// components
import File from '../File/File';

// styles
import styles from './panel-content.module.scss';

// types
import { NavItemName } from '../NavRail/types';
import { TPanelContentProps } from './types';

const PanelContent: FC<TPanelContentProps> = ({ activeNavItem, name, onRenameFile }) => (
  <div className={styles.PanelContent}>{activeNavItem === NavItemName.file && <File name={name} onRenameFile={onRenameFile} />}</div>
);

export default PanelContent;
