// types
import { NodeType } from 'types/design/enums';
import { TLineNode } from 'types/design/types';

// utils
import { canExportLineStroke } from '../canExportLineStroke';

const solid = { color: '#ff0000', opacity: 100, type: 'solid' as const };
const line = (strokes: TLineNode['strokes']): TLineNode => ({
  height: 0,
  id: 'l',
  name: 'l',
  parentId: null,
  rotation: 0,
  strokes,
  type: NodeType.line,
  width: 10,
  x: 0,
  y: 0,
});

describe('canExportLineStroke', () => {
  it('should allow a line without visible strokes or with one solid stroke', () => {
    // result
    expect(canExportLineStroke(line([]))).toBe(true);
    expect(canExportLineStroke(line([{ ...solid, visible: false }]))).toBe(true);
    expect(canExportLineStroke(line([solid]))).toBe(true);
  });

  it('should reject a gradient stroke or several visible strokes', () => {
    // result
    expect(canExportLineStroke(line([{ opacity: 100, stops: [], type: 'gradient-linear' } as never]))).toBe(false);
    expect(canExportLineStroke(line([solid, solid]))).toBe(false);
  });
});
