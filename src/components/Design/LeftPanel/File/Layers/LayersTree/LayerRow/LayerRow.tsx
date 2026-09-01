import { FC, ReactNode } from 'react';

// components
import LayerContextMenu from '../LayerContextMenu/LayerContextMenu';
import LayerRowIcon from './LayerRowIcon/LayerRowIcon';
import LayerRowMaskDecorations from './LayerRowMaskDecorations/LayerRowMaskDecorations';
import { TreeItem } from 'shared';

// types
import { TMaskConnectorInfo } from 'store/design/selectors';
import { TSceneNode } from 'types/design/types';
import { TToggleExpand } from 'shared/UI/Tree/types';

export type TLayerRowProps = {
  depth?: number;
  isExpanded?: boolean;
  isSelected: boolean;
  maskConnectorInfo?: TMaskConnectorInfo;
  node: TSceneNode;
  onToggleExpand?: TToggleExpand;
};

const LayerRow: FC<TLayerRowProps> = ({ depth, isExpanded, isSelected, maskConnectorInfo, node, onToggleExpand }) => (
  <TreeItem
    depth={depth}
    hideActions={node.isMask}
    isExpanded={isExpanded}
    isSelected={isSelected}
    node={node}
    onToggleExpand={onToggleExpand}
    renderIcon={(item): ReactNode => <LayerRowIcon node={item} />}
    renderMenu={(params): ReactNode => <LayerContextMenu {...params} node={node} />}
  >
    <LayerRowMaskDecorations maskConnectorLines={maskConnectorInfo} node={node} />
  </TreeItem>
);

export default LayerRow;
