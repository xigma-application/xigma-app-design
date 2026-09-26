// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { buildClosedVectorLoop } from '../buildClosedVectorLoop';
import { getClosedLoopPaintFillData } from '../getClosedLoopPaintFillData';

describe('getClosedLoopPaintFillData', () => {
  it('should fill the one face of a closed loop with the given paints', () => {
    // mock
    const paints = [{ color: '#ff0000', opacity: 100, type: 'solid' as const }];
    const vector: TVectorNode = {
      ...buildClosedVectorLoop(
        [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
          { x: 10, y: 10 },
        ],
        0,
      ),
      defaultFill: null,
      filledFaceKeys: [],
      id: 'v',
      name: 'Vector',
      parentId: null,
      rotation: 0,
      strokeWidth: 0,
      strokes: [],
      type: NodeType.vector,
      vertexHandleModes: {},
    };

    // before
    const { fillByKey, filledFaceKeys } = getClosedLoopPaintFillData(vector, paints);

    // result
    expect(filledFaceKeys).toHaveLength(1);
    expect(fillByKey[filledFaceKeys[0]]).toBe(paints);
  });
});
