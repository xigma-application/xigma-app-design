import cx from 'classnames';
import { FC } from 'react';

// components
import Label from 'shared/UI/Label/Label';

// styles
import styles from './section-column-labels.module.scss';

export type TSectionColumnLabelsProps = {
  labels?: [string] | [string, string];
  width: string;
};

export const SectionColumnLabels: FC<TSectionColumnLabelsProps> = ({ labels = [], width }) => (
  <div className={cx(styles.SectionColumnLabels)} style={{ width }}>
    {labels.map((label, index) => (
      <Label className={styles.SectionColumnLabels__label} color="secondary" fontSize={9} key={index}>
        {label}
      </Label>
    ))}
  </div>
);

export default SectionColumnLabels;
