import { FC } from 'react';

// components
import AlignmentOption from './AlignmentOption/AlignmentOption';
import E2EDataAttribute from 'shared/E2EDataAttributes/E2EDataAttribute';

// others
import { ALIGNMENT_OPTIONS } from './constants';

// styles
import styles from './alignment-area.module.scss';

// types
import { AlignmentLayout } from 'types/design/enums';
import { E2EAttribute } from 'types/e2e';
import { TE2EValue } from 'shared/E2EDataAttributes/types';

export type TAlignmentAreaProps = {
  e2eValue?: TE2EValue;
  isHorizontal: boolean;
  onClick: TFunc<[AlignmentLayout]>;
  value: AlignmentLayout;
};

export const AlignmentArea: FC<TAlignmentAreaProps> = ({ e2eValue = '', isHorizontal, onClick, value }) => (
  <E2EDataAttribute type={E2EAttribute.alignmentArea} value={e2eValue}>
    <div className={styles.AlignmentArea}>
      {ALIGNMENT_OPTIONS.map((alignment) => (
        <AlignmentOption
          alignment={alignment}
          isHorizontal={isHorizontal}
          isSelected={value === alignment}
          key={alignment}
          onClick={onClick}
        />
      ))}
    </div>
  </E2EDataAttribute>
);

export default AlignmentArea;
