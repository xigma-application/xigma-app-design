// types
import { NodeType } from 'types/design/enums';
import { TLineNode, TRectangleNode } from 'types/design/types';

// utils
import { getLineBoxFromPoints } from 'utils/canvas/line/getLineBoxFromPoints';
import { normalizeLineChanges } from '../normalizeLineChanges';

const line: TLineNode = {
  id: 'line',
  name: 'Line',
  parentId: null,
  strokes: [],
  type: NodeType.line,
  ...getLineBoxFromPoints({ x1: 0, x2: 100, y1: 0, y2: 0 }),
};

describe('normalizeLineChanges', () => {
  it('should turn moved endpoints into the line box, keeping the other endpoint and the other changes', () => {
    // result
    expect(normalizeLineChanges(line, { strokeWidth: 3, x2: 0, y2: 100 })).toEqual({
      strokeWidth: 3,
      ...getLineBoxFromPoints({ x1: 0, x2: 0, y1: 0, y2: 100 }),
    });
  });

  it('should keep a line flat when its height is changed', () => {
    // result
    expect(normalizeLineChanges(line, { height: 40, width: 50 })).toEqual({ height: 0, width: 50 });
  });

  it('should pass other line changes and changes of other layers through untouched', () => {
    // mock
    const changes = { width: 50 };
    const rectangle = { height: 10, id: 'rect', type: NodeType.rectangle } as TRectangleNode;

    // result
    expect(normalizeLineChanges(line, changes)).toBe(changes);
    expect(normalizeLineChanges(rectangle, { height: 40, x1: 5 })).toEqual({ height: 40, x1: 5 });
  });
});
