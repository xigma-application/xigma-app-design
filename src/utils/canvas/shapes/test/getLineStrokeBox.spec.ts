// types
import { NodeType } from 'types/design/enums';
import { TLineNode } from 'types/design/types';

// utils
import { getLineStrokeBox } from '../getLineStrokeBox';

const line: TLineNode = {
  height: 0,
  id: 'l',
  name: 'Line',
  parentId: null,
  rotation: 90,
  strokes: [],
  type: NodeType.line,
  width: 40,
  x: -10,
  y: 20,
};

describe('getLineStrokeBox', () => {
  it('should widen the line box by its stroke across the line, keeping its angle', () => {
    // result
    expect(getLineStrokeBox({ ...line, strokeWidth: 4 })).toEqual({ height: 4, rotation: 90, width: 40, x: -10, y: 18 });
  });

  it('should use the 1px default stroke width', () => {
    // result
    expect(getLineStrokeBox(line).height).toBe(1);
  });
});
