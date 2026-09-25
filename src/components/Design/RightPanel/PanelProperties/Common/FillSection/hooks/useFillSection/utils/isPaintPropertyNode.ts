// types
import { TPaintProperty } from 'types/design/paint/types';
import { TSceneNode } from 'types/design/types';
import { NodeType } from 'types/design/enums';
import { TStyledNode } from '../../../../AppearanceSection/types';

// utils
import { isStyledNode } from '../../../../AppearanceSection/utils/isStyledNode';

export const isPaintPropertyNode = (node: TSceneNode | undefined, property: TPaintProperty): node is TStyledNode =>
  isStyledNode(node) && (property === 'strokes' || node.type !== NodeType.line);
