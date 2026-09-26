// types
import { NodeType } from 'types/design/enums';
import { TBoxSceneNode } from 'types/design/types';

// utils
import { getDimensionNodeSize } from '../getDimensionNodeSize';
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';

describe('getDimensionNodeSize', () => {
  it('should return the size of a box node', () => {
    // mock
    const rectangle = { height: 20, id: 'r', type: NodeType.rectangle, width: 40 } as unknown as TBoxSceneNode;

    // result
    expect(getDimensionNodeSize(rectangle)).toEqual({ height: 20, width: 40 });
  });

  it('should return the size of the bounds of a vector', () => {
    // result
    expect(getDimensionNodeSize(makeSquareVector())).toEqual({ height: 100, width: 100 });
  });
});
