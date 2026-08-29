import { FC, ReactNode } from 'react';

// components
import LayerContextMenu from '../LayerContextMenu/LayerContextMenu';
import { TreeItem } from 'shared';

// types
import { TSceneNode } from 'types/design/types';

export type TLayerRowProps = {
  isSelected: boolean;
  node: TSceneNode;
};

const LayerRow: FC<TLayerRowProps> = ({ isSelected, node }) => (
  <TreeItem isSelected={isSelected} node={node} renderMenu={(params): ReactNode => <LayerContextMenu {...params} />} />
);

export default LayerRow;
