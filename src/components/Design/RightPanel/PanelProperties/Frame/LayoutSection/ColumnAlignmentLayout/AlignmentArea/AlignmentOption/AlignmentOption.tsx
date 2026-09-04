import cx from 'classnames';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Tooltip } from 'shared';

// others
import { translationNameSpace } from '../../constants';

// styles
import styles from './alignment-option.module.scss';

// types
import { AlignmentLayout } from 'types/design/enums';

// utils
import { getOptionViewModifiers } from './utils/getOptionViewModifiers';

export type TAlignmentOptionProps = {
  alignment: AlignmentLayout;
  isGapAutoHorizontal: boolean;
  isGapAutoVertical: boolean;
  isHighlighted: boolean;
  isHorizontal: boolean;
  isSelected: boolean;
  onClick: TFunc<[AlignmentLayout]>;
  onMouseEnter: TFunc<[AlignmentLayout]>;
  onMouseLeave: TFunc;
};

export const AlignmentOption: FC<TAlignmentOptionProps> = ({
  alignment,
  isGapAutoHorizontal,
  isGapAutoVertical,
  isHighlighted,
  isHorizontal,
  isSelected,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const { t } = useTranslation();
  const label = t(`${translationNameSpace}.alignmentOption.${alignment}`);
  const optionViewModifiers = getOptionViewModifiers(alignment, isHorizontal, isGapAutoVertical, isGapAutoHorizontal);

  return (
    <Tooltip content={label}>
      <button
        aria-label={label}
        aria-pressed={isSelected}
        className={styles.AlignmentOption}
        onClick={() => onClick(alignment)}
        onMouseEnter={() => onMouseEnter(alignment)}
        onMouseLeave={onMouseLeave}
        type="button"
      >
        <div
          className={cx(
            styles['AlignmentOption__option-view'],
            optionViewModifiers.map((modifier) => styles[`AlignmentOption__option-view--${modifier}`]),
          )}
        >
          {Array.from(Array(3), (_, index) => (
            <div
              className={cx(styles.AlignmentOption__indicator, {
                [styles['AlignmentOption__indicator--highlighted']]: isHighlighted,
                [styles['AlignmentOption__indicator--selected']]: isSelected,
              })}
              key={index}
            />
          ))}
        </div>
      </button>
    </Tooltip>
  );
};

export default AlignmentOption;
