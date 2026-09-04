import { FC } from 'react';

// components
import AlignmentOption from './AlignmentOption/AlignmentOption';
import E2EDataAttribute from 'shared/E2EDataAttributes/E2EDataAttribute';

// hooks
import { useColumnHover } from './hooks/useColumnHover';

// others
import { ALIGNMENT_OPTIONS } from './constants';

// styles
import styles from './alignment-area.module.scss';

// types
import { AlignmentLayout } from 'types/design/enums';
import { E2EAttribute } from 'types/e2e';
import { TE2EValue } from 'shared/E2EDataAttributes/types';

// utils
import { isOptionSelected } from './utils/isOptionSelected';

export type TAlignmentAreaProps = {
  e2eValue?: TE2EValue;
  isGapAutoHorizontal?: boolean;
  isGapAutoVertical?: boolean;
  isHorizontal: boolean;
  onClick: TFunc<[AlignmentLayout]>;
  value: AlignmentLayout;
};

export const AlignmentArea: FC<TAlignmentAreaProps> = ({
  e2eValue = '',
  isGapAutoHorizontal = false,
  isGapAutoVertical = false,
  isHorizontal,
  onClick,
  value,
}) => {
  const { isColumnHighlighted, onMouseEnterOption, onMouseLeaveOption } = useColumnHover(
    isGapAutoVertical,
    isGapAutoHorizontal,
    isHorizontal,
  );

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
