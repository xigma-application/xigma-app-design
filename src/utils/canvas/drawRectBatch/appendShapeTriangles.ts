// others
import { NodeType } from 'types/design/enums';

// types
import { TBatchShape, TRectBatch } from './types';

// utils
import { appendEllipseFan } from './appendEllipseFan';
import { appendRectangleQuads } from './appendRectangleQuads';
import { appendRectangleStroke } from './appendRectangleStroke';
import { appendRoundedRectFan } from './appendRoundedRectFan';
import { hasRoundedCorner } from './hasRoundedCorner';

export const appendShapeTriangles = (batch: TRectBatch, node: TBatchShape, opacity: number): void => {
  if (node.type === NodeType.ellipse) {
    appendEllipseFan(batch, node, opacity);
  } else {
    if (hasRoundedCorner(node)) {
      appendRoundedRectFan(batch, node, opacity);
    } else {
      appendRectangleQuads(batch, node, opacity);
    }

    appendRectangleStroke(batch, node, opacity);
  }
};
