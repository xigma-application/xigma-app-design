import { FC, ReactNode } from 'react';

// components
import LayerContextMenu from '../LayerContextMenu/LayerContextMenu';
import { TreeItem } from 'shared';

// types
import { TSceneNode } from 'types/design/types';
import { TToggleExpand } from 'shared/UI/Tree/types';

export type TLayerRowProps = {
  depth?: number;
  isExpanded?: boolean;
  isSelected: boolean;
  node: TSceneNode;
  onToggleExpand?: TToggleExpand;
};

const LayerRow: FC<TLayerRowProps> = ({ depth, isExpanded, isSelected, node, onToggleExpand }) => (
  <TreeItem
    depth={depth}
    isExpanded={isExpanded}
    isSelected={isSelected}
    node={node}
    onToggleExpand={onToggleExpand}
    renderMenu={(params): ReactNode => <LayerContextMenu {...params} />}
  />
);

export default LayerRow;
