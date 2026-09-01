import { FC, ReactNode } from 'react';

// components
import TreeDropIndicator from '../TreeDropIndicator/TreeDropIndicator';

// styles
import styles from '../tree.module.scss';

export type TTreeDropOverlayProps = {
  dropDepth: number;
  dropInsideIndex: number | null;
  insertionIndex: number | null;
  isDefault: boolean;
  renderDropIndicator?: (depth: number) => ReactNode;
  rowHeight: number;
};

const TreeDropOverlay: FC<TTreeDropOverlayProps> = ({
  dropDepth,
  dropInsideIndex,
  insertionIndex,
  isDefault,
  renderDropIndicator,
  rowHeight,
}) => (
  <>
    {insertionIndex !== null && dropInsideIndex === null && (
      <TreeDropIndicator insertionIndex={insertionIndex} isDefault={isDefault} rowHeight={rowHeight}>
        {renderDropIndicator?.(dropDepth)}
      </TreeDropIndicator>
    )}
    {dropInsideIndex !== null && (
      <div
        className={styles.Tree__dropInsideOutline}
        style={{ height: rowHeight, transform: `translateY(${dropInsideIndex * rowHeight}px)` }}
      />
    )}
  </>
);

export default TreeDropOverlay;
