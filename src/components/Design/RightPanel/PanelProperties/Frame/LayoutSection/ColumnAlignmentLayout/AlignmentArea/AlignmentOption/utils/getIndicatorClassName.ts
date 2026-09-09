import cx from 'classnames';

// styles
import styles from '../alignment-option.module.scss';

export const getIndicatorClassName = (isHighlighted: boolean, isSelected: boolean): string =>
  cx(styles.AlignmentOption__indicator, {
    [styles['AlignmentOption__indicator--highlighted']]: isHighlighted,
    [styles['AlignmentOption__indicator--selected']]: isSelected,
  });
