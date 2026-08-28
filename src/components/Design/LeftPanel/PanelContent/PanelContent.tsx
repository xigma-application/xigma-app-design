import { FC } from 'react';

// components
import File from '../File/File';

// styles
import styles from './panel-content.module.scss';

// types
import { NavItemName } from '../NavRail/types';

export type TPanelContentProps = {
  activeNavItem: NavItemName;
};

const PanelContent: FC<TPanelContentProps> = ({ activeNavItem }) => (
  <div className={styles.PanelContent}>{activeNavItem === NavItemName.file && <File />}</div>
);

export default PanelContent;
