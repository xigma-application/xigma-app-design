import cx from 'classnames';
import { CSSProperties, FC, Fragment } from 'react';

// styles
import styles from './alignment-option.module.scss';

// types
import { AlignmentLayout } from 'types/design/enums';

const CENTER_COLUMN_ALIGNMENTS = [AlignmentLayout.topCenter, AlignmentLayout.center, AlignmentLayout.bottomCenter];
const RIGHT_COLUMN_ALIGNMENTS = [AlignmentLayout.topRight, AlignmentLayout.right, AlignmentLayout.bottomRight];

export type TOptionIndicatorsProps = {
  alignment: AlignmentLayout;
  isHighlighted: boolean;
  isSelected: boolean;
  isWrap: boolean;
};

const getIndicatorClassName = (isHighlighted: boolean, isSelected: boolean): string =>
  cx(styles.AlignmentOption__indicator, {
    [styles['AlignmentOption__indicator--highlighted']]: isHighlighted,
    [styles['AlignmentOption__indicator--selected']]: isSelected,
  });

const getWrapRowJustifyContent = (alignment: AlignmentLayout): CSSProperties['justifyContent'] => {
  if (CENTER_COLUMN_ALIGNMENTS.includes(alignment)) {
    return 'center';
  }

  if (RIGHT_COLUMN_ALIGNMENTS.includes(alignment)) {
    return 'flex-end';
  }

  return 'flex-start';
};

export const OptionIndicators: FC<TOptionIndicatorsProps> = ({ alignment, isHighlighted, isSelected, isWrap }) => {
  const indicatorClassName = getIndicatorClassName(isHighlighted, isSelected);

  if (isWrap) {
    const wrapRowStyle: CSSProperties = { justifyContent: getWrapRowJustifyContent(alignment) };

    return (
      <Fragment>
        <div className={styles['AlignmentOption__wrap-row']} style={wrapRowStyle}>
          {Array.from(Array(3), (_, index) => (
            <div className={indicatorClassName} key={index} />
          ))}
        </div>
        <div className={styles['AlignmentOption__wrap-row']} style={wrapRowStyle}>
          {Array.from(Array(2), (_, index) => (
            <div className={indicatorClassName} key={index} />
          ))}
        </div>
      </Fragment>
    );
  }

  return (
    <Fragment>
      {Array.from(Array(3), (_, index) => (
        <div className={indicatorClassName} key={index} />
      ))}
    </Fragment>
  );
};

export default OptionIndicators;
