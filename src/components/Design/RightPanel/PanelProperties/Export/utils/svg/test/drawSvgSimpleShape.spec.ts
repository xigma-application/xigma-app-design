// types
import { NodeType } from 'types/design/enums';
import { TStarNode } from 'types/design/types';

// utils
import { drawSvgSimpleShape } from '../drawSvgSimpleShape';

const drawSvgStarShapeMock = vi.fn();

vi.mock('../drawSvgStarShape', () => ({ drawSvgStarShape: (...args: unknown[]): void => drawSvgStarShapeMock(...args) }));

const bounds = { height: 100, width: 100, x: 0, y: 0 };

const star: TStarNode = {
  fill: '#ff0000',
  flipX: false,
  flipY: false,
  height: 10,
  id: 's',
  name: 's',
  parentId: null,
  points: 5,
  ratio: 0.5,
  rotation: 0,
  type: NodeType.star,
  width: 10,
  x: 0,
  y: 0,
};

describe('drawSvgSimpleShape', () => {
  it('should draw a star with its opacity', () => {
    // action
    drawSvgSimpleShape([], star, {}, bounds);

    // result
    expect(drawSvgStarShapeMock).toHaveBeenCalledWith([], star, 1, bounds);
  });
});
