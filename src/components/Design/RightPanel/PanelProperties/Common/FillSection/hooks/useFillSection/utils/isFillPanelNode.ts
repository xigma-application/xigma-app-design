// types
import { NodeType } from 'types/design/enums';
import { TPaintProperty } from 'types/design/paint/types';
import { TSceneNode, TVectorNode } from 'types/design/types';
import { TStyledNode } from '../../../../AppearanceSection/types';

// utils
import { isPaintPropertyNode } from './isPaintPropertyNode';

export const isFillPanelNode = (node: TSceneNode | undefined, property: TPaintProperty): node is TStyledNode | TVectorNode =>
  isPaintPropertyNode(node, property) || (property === 'fills' && node?.type === NodeType.vector);
