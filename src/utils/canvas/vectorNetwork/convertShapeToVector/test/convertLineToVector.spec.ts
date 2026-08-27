// others
import { LINE_RENDER_STROKE_WIDTH } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TLineNode } from 'types/design/types';

// utils
import { convertLineToVector } from '../convertLineToVector';

describe('convertLineToVector', () => {
  it('should convert a line into an open 2-vertex path carrying its stroke color', () => {
    // mock
    const node: TLineNode = {
      id: 'line-1',
      name: 'Line 1',
      parentId: null,
      stroke: '#ff00ff',
      type: NodeType.line,
      x1: 0,
      x2: 50,
      y1: 10,
      y2: 40,
    };

    // action
    const result = convertLineToVector(node);

    // result
    expect(result.type).toBe(NodeType.vector);
    expect(result.id).toBe('line-1');
    expect(result.fillColor).toBeNull();
    expect(result.filledFaceKeys).toEqual([]);
    expect(result.strokeColor).toBe('#ff00ff');
    expect(result.strokeWidth).toBe(LINE_RENDER_STROKE_WIDTH);
    expect(Object.keys(result.vertices)).toHaveLength(1 + 1);
    expect(Object.keys(result.segments)).toHaveLength(1);

    const points = Object.values(result.vertices).map((vertex) => ({ x: vertex.x, y: vertex.y }));

    expect(points).toEqual(
      expect.arrayContaining([
        { x: 0, y: 10 },
        { x: 50, y: 40 },
      ]),
    );
  });

  it('should drop the arrowhead style entirely, since TVectorNode has no equivalent field', () => {
    // mock
    const node: TLineNode = {
      endPoint: 'arrow',
      id: 'arrow-1',
      name: 'Arrow 1',
      parentId: null,
      startPoint: 'arrow',
      stroke: '#000000',
      type: NodeType.line,
      x1: 0,
      x2: 10,
      y1: 0,
      y2: 10,
    };

    // action
    const result = convertLineToVector(node);

    // result
    expect(result).not.toHaveProperty('startPoint');
    expect(result).not.toHaveProperty('endPoint');
    expect(result.capStyle).toBeUndefined();
  });
});
