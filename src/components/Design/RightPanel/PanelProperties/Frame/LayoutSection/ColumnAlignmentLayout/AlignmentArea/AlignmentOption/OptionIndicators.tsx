import cx from 'classnames';
import { CSSProperties, FC, Fragment } from 'react';

// styles
import styles from './alignment-option.module.scss';

// types
import { AlignmentLayout } from 'types/design/enums';

// utils
import { getIndicatorClassName } from './utils/getIndicatorClassName';
import { getWrapRowJustifyContent } from './utils/getWrapRowJustifyContent';

export type TOptionIndicatorsProps = {
  alignment: AlignmentLayout;
  isBaseline?: boolean;
  isHighlighted: boolean;
  isSelected: boolean;
  isWrap: boolean;
};

export const OptionIndicators: FC<TOptionIndicatorsProps> = ({ alignment, isBaseline = false, isHighlighted, isSelected, isWrap }) => {
  const indicatorClassName = getIndicatorClassName(isHighlighted, isSelected);

  if (isBaseline) {
    if (!isSelected && !isHighlighted) {
      return null;
    }

    return (
      <span
        className={cx(styles.AlignmentOption__glyph, {
          [styles['AlignmentOption__glyph--highlighted']]: isHighlighted,
          [styles['AlignmentOption__glyph--selected']]: isSelected,
        })}
      >
        A
      </span>
    );
  }

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
