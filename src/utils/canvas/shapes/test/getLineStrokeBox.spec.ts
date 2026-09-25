// types
import { NodeType } from 'types/design/enums';
import { TDraftLine } from 'types/design/types';

// utils
import { getLineStrokeBox } from '../getLineStrokeBox';

const line: TDraftLine = { strokes: [], type: NodeType.line, x1: 10, x2: 10, y1: 0, y2: 40 };

describe('getLineStrokeBox', () => {
  it('should lay a box as long as the line and as tall as its stroke along the line, turned by its angle', () => {
    // result
    expect(getLineStrokeBox({ ...line, strokeWidth: 4 })).toEqual({ height: 4, rotation: 90, width: 40, x: -10, y: 18 });
  });

  it('should use the 1px default stroke width', () => {
    // result
    expect(getLineStrokeBox(line).height).toBe(1);
  });
});
