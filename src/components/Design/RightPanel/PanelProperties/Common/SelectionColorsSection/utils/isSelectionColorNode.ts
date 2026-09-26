// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';
import { TSelectionColorNode } from '../types';

// utils
import { isAppearanceNode } from '../../AppearanceSection/types';

export const isSelectionColorNode = (node: TSceneNode | undefined): node is TSelectionColorNode =>
  isAppearanceNode(node) || node?.type === NodeType.vector;
