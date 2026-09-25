// types
import { TLineNode } from 'types/design/types';
import { TLineStrokeShape } from '../types';

// utils
import { getLineFrame } from './getLineFrame';
import { getLineModeStrokeShape } from './getLineModeStrokeShape';
import { getLineStrokeOffset } from './getLineStrokeOffset';
import { getLineStrokeOutlineLoops } from '../../vectorNetwork/getNodeStrokeOutline/getLineStrokeOutlineLoops';
import { translatePolygons } from './translatePolygons';

const cache = new WeakMap<TLineNode, TLineStrokeShape | null>();

const computeLineStrokeShape = (line: TLineNode): TLineStrokeShape | null => {
  const frame = getLineFrame(line);
  const outline = getLineStrokeOutlineLoops(line, frame.halfWidth);

  if (outline) {
    const modeShape = getLineModeStrokeShape(line, frame);

    return modeShape
      ? { ...modeShape, polygons: translatePolygons(modeShape.polygons, getLineStrokeOffset(line, frame)) }
      : { fillRule: 'evenOdd', polygons: [outline.outer] };
  }

  return null;
};

export const getLineStrokeShape = (line: TLineNode): TLineStrokeShape | null => {
  if (!cache.has(line)) {
    cache.set(line, computeLineStrokeShape(line));
  }

  return cache.get(line) ?? null;
};
