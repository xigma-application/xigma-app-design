// types
import { TGradientPaint, TSolidPaint } from 'types/design/paint/types';
import { TSelectionColorNode, TSelectionColorOccurrence } from '../types';

// utils
import { getSelectionColorPaintSources } from './getSelectionColorPaintSources';
import { isSelectionColorPaint } from './isSelectionColorPaint';

export type TSelectionColorEntry = { occurrence: TSelectionColorOccurrence; paint: TSolidPaint | TGradientPaint };

export const getSelectionColorOccurrenceEntries = (nodes: TSelectionColorNode[]): TSelectionColorEntry[] =>
  nodes.flatMap((node) =>
    getSelectionColorPaintSources(node).flatMap(({ faceKey, paints, property }) =>
      paints.reduce<TSelectionColorEntry[]>((entries, paint, index) => {
        if (isSelectionColorPaint(paint) && paint.visible !== false) {
          entries.push({ occurrence: { faceKey, index, nodeId: node.id, property }, paint });
        }

        return entries;
      }, []),
    ),
  );
