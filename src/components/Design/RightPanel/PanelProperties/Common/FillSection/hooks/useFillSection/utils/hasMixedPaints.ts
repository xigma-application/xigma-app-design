import { isEqual } from 'lodash';

// types
import { TPaintProperty } from 'types/design/paint/types';
import { TStyledNode } from '../../../../AppearanceSection/types';
import { TVectorNode } from 'types/design/types';

// utils
import { getPanelPaints } from './getPanelPaints';

export const hasMixedPaints = (nodes: (TStyledNode | TVectorNode)[], property: TPaintProperty): boolean => {
  const paints = nodes.map((node) => getPanelPaints(node, property));
  return paints.some((nodePaints) => nodePaints === null || !isEqual(nodePaints, paints[0]));
};
