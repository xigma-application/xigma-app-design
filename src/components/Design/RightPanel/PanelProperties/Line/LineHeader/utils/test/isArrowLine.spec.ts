// types
import { LineEndpoint, NodeType } from 'types/design/enums';
import { TLineNode } from 'types/design/types';

// utils
import { isArrowLine } from '../isArrowLine';

const line = (overrides: Partial<TLineNode> = {}): TLineNode => ({
  height: 0,
  id: 'l',
  name: 'Line',
  parentId: null,
  rotation: 0,
  strokes: [],
  type: NodeType.line,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

describe('isArrowLine', () => {
  it('should count a line with an arrowhead at either end as an arrow', () => {
    // result
    expect(isArrowLine(line({ endPoint: LineEndpoint.lineArrow }))).toBe(true);
    expect(isArrowLine(line({ startPoint: LineEndpoint.diamondArrow }))).toBe(true);
  });

  it('should not count a plain line or one with only round or square caps', () => {
    // result
    expect(isArrowLine(line())).toBe(false);
    expect(isArrowLine(line({ endPoint: LineEndpoint.round, startPoint: LineEndpoint.square }))).toBe(false);
  });
});
