import { isEqual } from 'lodash';

// types
import { TAppearanceNode } from '../../../../AppearanceSection/types';
import { TPaintProperty } from 'types/design/paint/types';

// utils
import { getNodePaints } from 'utils/design/paint/getNodePaints';

export const hasMixedPaints = (nodes: TAppearanceNode[], property: TPaintProperty): boolean =>
  nodes.some((node) => !isEqual(getNodePaints(node, property), getNodePaints(nodes[0], property)));
