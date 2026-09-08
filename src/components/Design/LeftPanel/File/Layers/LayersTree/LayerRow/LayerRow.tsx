import { FC, ReactNode } from 'react';

// components
import LayerContextMenu from '../LayerContextMenu/LayerContextMenu';
import LayerRowIcon from './LayerRowIcon/LayerRowIcon';
import LayerRowMaskDecorations from './LayerRowMaskDecorations/LayerRowMaskDecorations';
import { TreeItem } from 'shared';

// store
import { selectNodes, type TMaskConnectorInfo } from 'store/design/selectors';
import { useAppSelector } from 'store';

// types
import { TSceneNode } from 'types/design/types';
import { TToggleExpand } from 'shared/UI/Tree/types';

// utils
import { getIsMaskChild } from 'store/design/utils/getIsMaskChild';

export type TLayerRowProps = {
  depth?: number;
  isExpanded?: boolean;
  isSelected: boolean;
  maskConnectorInfo?: TMaskConnectorInfo;
  node: TSceneNode;
  onToggleExpand?: TToggleExpand;
};

const LayerRow: FC<TLayerRowProps> = ({ depth, isExpanded, isSelected, maskConnectorInfo, node, onToggleExpand }) => {
  const nodes = useAppSelector(selectNodes);
  const isMask = getIsMaskChild(node, nodes);

  return (
    <TreeItem
      depth={depth}
      hideActions={isMask}
      isExpanded={isExpanded}
      isSelected={isSelected}
      node={node}
      onToggleExpand={onToggleExpand}
      renderIcon={(item): ReactNode => <LayerRowIcon isMask={isMask} node={item} />}
      renderMenu={(params): ReactNode => <LayerContextMenu {...params} node={node} />}
    >
      <LayerRowMaskDecorations isMask={isMask} maskConnectorLines={maskConnectorInfo} />
    </TreeItem>
  );
};

export default LayerRow;
