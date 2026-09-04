import { FC, ReactNode } from 'react';

// styles
import styles from './section-column-button-icons.module.scss';

export type TSectionColumnButtonIconsProps = {
  buttonsIcon?: ReactNode[];
};

export const SectionColumnButtonIcons: FC<TSectionColumnButtonIconsProps> = ({ buttonsIcon = [] }) => (
  <div>
    <div className={styles.SectionColumnButtonIcons}>{buttonsIcon.map((buttonIcon) => buttonIcon)}</div>
  </div>
);

export default SectionColumnButtonIcons;
