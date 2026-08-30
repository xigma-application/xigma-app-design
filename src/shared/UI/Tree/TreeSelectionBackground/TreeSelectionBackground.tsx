import cx from 'classnames';
import { FC } from 'react';

// others
import { TREE_SELECTION_BACKGROUND_INSET_PX } from '../constants';

// styles
import styles from '../tree.module.scss';

// types
import { TSelectionBackgroundSegment } from '../utils/getSelectionBackgroundSegments';

export type TTreeSelectionBackgroundProps = {
  segments: TSelectionBackgroundSegment[];
};

const TreeSelectionBackground: FC<TTreeSelectionBackgroundProps> = ({ segments }) => (
  <>
    {segments.map((segment) => (
      <div
        className={cx(
          styles.Tree__selectionBackground,
          !segment.isRoundedTop && styles['Tree__selectionBackground--squareTop'],
          !segment.isRoundedBottom && styles['Tree__selectionBackground--squareBottom'],
        )}
        key={segment.start}
        style={{
          height:
            segment.size -
            (segment.isRoundedTop ? TREE_SELECTION_BACKGROUND_INSET_PX : 0) -
            (segment.isRoundedBottom ? TREE_SELECTION_BACKGROUND_INSET_PX : 0),
          transform: `translateY(${segment.start + (segment.isRoundedTop ? TREE_SELECTION_BACKGROUND_INSET_PX : 0)}px)`,
        }}
      />
    ))}
  </>
);

export default TreeSelectionBackground;
