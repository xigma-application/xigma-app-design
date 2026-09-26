// types
import { NodeType } from 'types/design/enums';
import { TBoxSceneNode, TVectorNode } from 'types/design/types';

// utils
import { getRoundedVectorSizes } from 'components/Design/RightPanel/PanelProperties/Vector/VectorDimensions/utils/getRoundedVectorSizes';

export const getDimensionNodeSize = (node: TBoxSceneNode | TVectorNode): { height: number; width: number } =>
  node.type === NodeType.vector ? getRoundedVectorSizes([node])[0] : { height: node.height, width: node.width };
