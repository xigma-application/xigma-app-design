import cx from 'classnames';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

// components
import AlignmentOption from './AlignmentOption/AlignmentOption';
import E2EDataAttribute from 'shared/E2EDataAttributes/E2EDataAttribute';
import { Icon, Tooltip } from 'shared';

// hooks
import { useColumnHover } from './hooks/useColumnHover';

// others
import { ALIGNMENT_OPTIONS, BASELINE_ALIGNMENT_OPTIONS } from './constants';
import { translationNameSpace } from '../constants';

// styles
import styles from './alignment-area.module.scss';

// types
import { AlignmentLayout } from 'types/design/enums';
import { E2EAttribute } from 'types/e2e';
import { TE2EValue } from 'shared/E2EDataAttributes/types';

// utils
import { isBaselineOptionSelected } from './utils/isBaselineOptionSelected';
import { isOptionSelected } from './utils/isOptionSelected';

export type TAlignmentAreaProps = {
  e2eValue?: TE2EValue;
  isBaselineAligned?: boolean;
  isGapAutoHorizontal?: boolean;
  isGapAutoVertical?: boolean;
  isHorizontal: boolean;
  isWrap?: boolean;
  onClick: TFunc<[AlignmentLayout]>;
  onRemoveBaselineAlignment?: TFunc;
  value: AlignmentLayout;
};

export const AlignmentArea: FC<TAlignmentAreaProps> = ({
  e2eValue = '',
  isBaselineAligned = false,
  isGapAutoHorizontal = false,
  isGapAutoVertical = false,
  isHorizontal,
  isWrap = false,
  onClick,
  onRemoveBaselineAlignment,
  value,
}) => {
  const { t } = useTranslation();
  const [hoveredBaselineOption, setHoveredBaselineOption] = useState<AlignmentLayout | null>(null);
  const { isColumnHighlighted, onMouseEnterOption, onMouseLeaveOption } = useColumnHover(
    isGapAutoVertical,
    isGapAutoHorizontal,
    isHorizontal,
  );

  if (isBaselineAligned) {
    const removeLabel = t(`${translationNameSpace}.removeBaselineAlignment`);

    return (
      <E2EDataAttribute type={E2EAttribute.alignmentArea} value={e2eValue}>
        <div className={cx(styles.AlignmentArea, styles['AlignmentArea--baseline'])}>
          {BASELINE_ALIGNMENT_OPTIONS.map((alignment) => (
            <AlignmentOption
              alignment={alignment}
              isBaseline
              isGapAutoHorizontal={isGapAutoHorizontal}
              isGapAutoVertical={false}
              isHighlighted={hoveredBaselineOption === alignment}
              isHorizontal
              isSelected={isBaselineOptionSelected(alignment, value, isGapAutoHorizontal)}
              isWrap={false}
              key={alignment}
              onClick={onClick}
              onMouseEnter={setHoveredBaselineOption}
              onMouseLeave={() => setHoveredBaselineOption(null)}
            />
          ))}
          <Tooltip content={removeLabel}>
            <button
              aria-label={removeLabel}
              className={styles['AlignmentArea__remove-baseline']}
              onClick={() => onRemoveBaselineAlignment?.()}
              type="button"
            >
              <span className={styles['AlignmentArea__remove-baseline-icon']}>
                <Icon name="Minus" size={16} />
              </span>
            </button>
          </Tooltip>
        </div>
      </E2EDataAttribute>
    );
  }

  return (
    <E2EDataAttribute type={E2EAttribute.alignmentArea} value={e2eValue}>
      <div className={styles.AlignmentArea}>
        {ALIGNMENT_OPTIONS.map((alignment) => (
          <AlignmentOption
            alignment={alignment}
            isGapAutoHorizontal={isGapAutoHorizontal}
            isGapAutoVertical={isGapAutoVertical}
            isHighlighted={isColumnHighlighted(alignment)}
            isHorizontal={isHorizontal}
            isSelected={isOptionSelected(alignment, value, isGapAutoVertical, isGapAutoHorizontal, isHorizontal)}
            isWrap={isWrap}
            key={alignment}
            onClick={onClick}
            onMouseEnter={onMouseEnterOption}
            onMouseLeave={onMouseLeaveOption}
          />
        ))}
      </div>
    </E2EDataAttribute>
  );
};

export default AlignmentArea;
