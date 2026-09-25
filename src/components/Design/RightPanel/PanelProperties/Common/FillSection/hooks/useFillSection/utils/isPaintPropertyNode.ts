// types
import { TPaintProperty } from 'types/design/paint/types';
import { TSceneNode } from 'types/design/types';
import { TStyledNode, isAppearanceNode } from '../../../../AppearanceSection/types';

// utils
import { isStyledNode } from '../../../../AppearanceSection/utils/isStyledNode';

export const isPaintPropertyNode = (node: TSceneNode | undefined, property: TPaintProperty): node is TStyledNode =>
  property === 'strokes' ? isStyledNode(node) : isAppearanceNode(node);
