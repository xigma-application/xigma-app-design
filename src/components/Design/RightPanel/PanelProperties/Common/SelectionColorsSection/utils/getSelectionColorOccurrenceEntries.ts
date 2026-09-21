// types
import { TAppearanceNode } from '../../AppearanceSection/types';
import { TGradientPaint, TPaintProperty, TSolidPaint } from 'types/design/paint/types';
import { TSelectionColorOccurrence } from '../types';

// utils
import { getNodePaints } from 'utils/design/paint/getNodePaints';
import { isSelectionColorPaint } from './isSelectionColorPaint';

const PAINT_PROPERTIES: TPaintProperty[] = ['fills', 'strokes'];

export type TSelectionColorEntry = { occurrence: TSelectionColorOccurrence; paint: TSolidPaint | TGradientPaint };

export const getSelectionColorOccurrenceEntries = (nodes: TAppearanceNode[]): TSelectionColorEntry[] =>
  nodes.flatMap((node) =>
    PAINT_PROPERTIES.flatMap((property) =>
      getNodePaints(node, property).reduce<TSelectionColorEntry[]>((entries, paint, index) => {
        if (isSelectionColorPaint(paint) && paint.visible !== false) {
          entries.push({ occurrence: { index, nodeId: node.id, property }, paint });
        }

        return entries;
      }, []),
    ),
  );
