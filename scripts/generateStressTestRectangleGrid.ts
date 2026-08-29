import { nanoid } from '@reduxjs/toolkit';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

const RECTANGLE_SIZE = 10;
const GAP = 4;
const COLUMNS = 10;
const FILL_COLOR = '#D9D9D9';

export const generateStressTestRectangleGrid = (count = 100): TRectangleNode[] =>
  Array.from({ length: count }, (_, index) => {
    const x = (index % COLUMNS) * (RECTANGLE_SIZE + GAP);
    const y = Math.floor(index / COLUMNS) * (RECTANGLE_SIZE + GAP);

    return {
      fill: FILL_COLOR,
      height: RECTANGLE_SIZE,
      id: nanoid(),
      name: `Rectangle ${index + 1}`,
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: RECTANGLE_SIZE,
      x,
      y,
    };
  });
