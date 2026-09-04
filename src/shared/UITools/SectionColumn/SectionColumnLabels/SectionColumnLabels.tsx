import cx from 'classnames';
import { FC } from 'react';

// components
import Text from 'shared/UI/Text/Text';

// styles
import styles from './section-column-labels.module.scss';

export type TSectionColumnLabelsProps = {
  labels?: [string] | [string, string];
  width: string;
};

export const SectionColumnLabels: FC<TSectionColumnLabelsProps> = ({ labels = [], width }) => (
  <div className={cx(styles.SectionColumnLabels)} style={{ width }}>
    {labels.map((label, index) => (
      <Text className={styles.SectionColumnLabels__label} color="secondary" fontSize={9} key={index}>
        {label}
      </Text>
    ))}
  </div>
);

export default SectionColumnLabels;
