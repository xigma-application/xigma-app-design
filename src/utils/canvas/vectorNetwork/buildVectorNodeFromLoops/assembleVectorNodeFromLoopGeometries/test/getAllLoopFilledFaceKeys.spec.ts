// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode, TVectorNode } from 'types/design/types';

// utils
import { convertNodeToVector } from '../../../convertShapeToVector/convertNodeToVector';
import { getAllLoopFilledFaceKeys } from '../getAllLoopFilledFaceKeys';

const rectangle: TRectangleNode = {
  fills: [],
  height: 50,
  id: 'rect',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 100,
  x: 0,
  y: 0,
};

describe('getAllLoopFilledFaceKeys', () => {
  it('should fill the single face enclosed by a closed loop', () => {
    // before
    const keys = getAllLoopFilledFaceKeys(convertNodeToVector(rectangle));

    // result
    expect(keys).toHaveLength(1);
  });

  it('should fill nothing for an empty network', () => {
    // result
    expect(getAllLoopFilledFaceKeys({ segments: {}, vertices: {} } as unknown as TVectorNode)).toEqual([]);
  });
});
