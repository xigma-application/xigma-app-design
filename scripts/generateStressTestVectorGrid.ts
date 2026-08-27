import { nanoid } from '@reduxjs/toolkit';

// types
import { NodeType } from 'types/design/enums';
import { TVectorNode, TVectorSegment, TVectorVertex } from 'types/design/types';

const SQUARE_SIZE = 40;
const GAP = 20;
const COLUMNS = 10;

export const generateStressTestVectorGrid = (count = 100): TVectorNode => {
  const vertices: Record<string, TVectorVertex> = {};
  const segments: Record<string, TVectorSegment> = {};

  for (let i = 0; i < count; i += 1) {
    const originX = (i % COLUMNS) * (SQUARE_SIZE + GAP);
    const originY = Math.floor(i / COLUMNS) * (SQUARE_SIZE + GAP);
    const corners: [number, number][] = [
      [originX, originY],
      [originX + SQUARE_SIZE, originY],
      [originX + SQUARE_SIZE, originY + SQUARE_SIZE],
      [originX, originY + SQUARE_SIZE],
    ];

    const vertexIds = corners.map(([x, y]) => {
      const id = nanoid();

      vertices[id] = { id, x, y };

      return id;
    });

    vertexIds.forEach((startId, index) => {
      const endId = vertexIds[(index + 1) % vertexIds.length];
      const id = nanoid();

      segments[id] = { endId, id, startId, tangentEnd: null, tangentStart: null };
    });
  }

  return {
    fillColor: '#D9D9D9',
    filledFaceKeys: [],
    id: nanoid(),
    name: 'Vector',
    parentId: null,
    rotation: 0,
    segments,
    strokeColor: '#000000',
    strokeWidth: 1,
    type: NodeType.vector,
    vertexHandleModes: {},
    vertices,
  };
};
