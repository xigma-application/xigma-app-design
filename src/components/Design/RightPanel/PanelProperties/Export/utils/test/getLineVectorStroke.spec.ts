// types
import { NodeType } from 'types/design/enums';
import { TLineNode } from 'types/design/types';

// utils
import { getLineVectorStroke } from '../getLineVectorStroke';

const solid = { color: '#ff0000', opacity: 100, type: 'solid' as const };
const line = (strokes: TLineNode['strokes']): TLineNode => ({
  id: 'l',
  name: 'l',
  parentId: null,
  strokes,
  type: NodeType.line,
  x1: 0,
  x2: 10,
  y1: 0,
  y2: 0,
});

describe('getLineVectorStroke', () => {
  it('should return the only visible stroke when it is solid, skipping hidden ones', () => {
    // result
    expect(getLineVectorStroke(line([{ ...solid, color: '#000000', visible: false }, solid]))).toBe(solid);
  });

  it('should return nothing for no stroke, a non-solid stroke or several visible strokes', () => {
    // result
    expect(getLineVectorStroke(line([]))).toBeNull();
    expect(getLineVectorStroke(line([{ opacity: 100, stops: [], type: 'gradient-linear' } as never]))).toBeNull();
    expect(getLineVectorStroke(line([solid, solid]))).toBeNull();
  });
});
