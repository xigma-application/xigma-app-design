import { FC } from 'react';

// styles
import styles from './section-hint.module.scss';

export type TSectionHintProps = {
  label: string;
};

export const SectionHint: FC<TSectionHintProps> = ({ label }) => <p className={styles.SectionHint}>{label}</p>;

export default SectionHint;
