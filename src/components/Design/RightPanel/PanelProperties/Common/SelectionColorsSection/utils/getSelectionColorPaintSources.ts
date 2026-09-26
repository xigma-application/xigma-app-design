// types
import { NodeType } from 'types/design/enums';
import { TSelectionColorNode, TSelectionColorPaintSource } from '../types';

// utils
import { getEffectiveVectorFill } from 'utils/canvas/vectorNetwork/getEffectiveVectorFill';
import { getNodePaints } from 'utils/design/paint/getNodePaints';

export const getSelectionColorPaintSources = (node: TSelectionColorNode): TSelectionColorPaintSource[] =>
  node.type === NodeType.vector
    ? [
        ...node.filledFaceKeys.map((faceKey) => ({ faceKey, paints: getEffectiveVectorFill(node, faceKey), property: 'fills' as const })),
        { paints: node.strokes, property: 'strokes' },
      ]
    : [
        { paints: getNodePaints(node, 'fills'), property: 'fills' },
        { paints: getNodePaints(node, 'strokes'), property: 'strokes' },
      ];
