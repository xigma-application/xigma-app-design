// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { buildClosedVectorLoop } from 'utils/canvas/vectorNetwork/convertShapeToVector/utils/buildClosedVectorLoop';

export const makeSquareVector = (overrides: Partial<TVectorNode> = {}): TVectorNode => ({
  ...buildClosedVectorLoop(
    [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
    ],
    0,
  ),
  defaultFill: null,
  filledFaceKeys: [],
  id: 'vector',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  strokeColor: '#ff0000',
  strokeWidth: 10,
  type: NodeType.vector,
  vertexHandleModes: {},
  ...overrides,
});
