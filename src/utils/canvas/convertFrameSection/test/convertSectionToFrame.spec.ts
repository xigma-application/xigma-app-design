// types
import { NodeType, StrokeAlign } from 'types/design/enums';
import { TSectionNode } from 'types/design/types';

// utils
import { convertSectionToFrame } from '../convertSectionToFrame';

const buildSection = (overrides: Partial<TSectionNode> = {}): TSectionNode => ({
  childIds: [],
  fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
  height: 100,
  id: 'section-1',
  name: 'Section',
  parentId: 'parent-1',
  rotation: 0,
  type: NodeType.section,
  width: 200,
  x: 10,
  y: 20,
  ...overrides,
});

describe('convertSectionToFrame', () => {
  it('should carry over id, position, size, rotation, name and parent, switching only the type', () => {
    const section = buildSection();

    expect(convertSectionToFrame(section)).toEqual({
      childIds: [],
      clipContent: true,
      cornerRadius: undefined,
      fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
      height: 100,
      hidden: undefined,
      id: 'section-1',
      locked: undefined,
      name: 'Section',
      parentId: 'parent-1',
      rotation: 0,
      strokeAlign: undefined,
      strokeWidth: undefined,
      strokes: undefined,
      type: NodeType.frame,
      width: 200,
      x: 10,
      y: 20,
    });
  });

  it('should carry over hidden and locked when set', () => {
    const section = buildSection({ hidden: true, locked: true });

    expect(convertSectionToFrame(section)).toMatchObject({ hidden: true, locked: true });
  });

  it('should carry over the section’s children instead of discarding them', () => {
    const section = buildSection({ childIds: ['a', 'b'] });

    expect(convertSectionToFrame(section).childIds).toEqual(['a', 'b']);
  });

  it('should carry over the section strokes', () => {
    const strokes = [{ color: '#ffffff', opacity: 10, type: 'solid' as const }];

    expect(convertSectionToFrame(buildSection({ strokeAlign: StrokeAlign.inside, strokeWidth: 1, strokes }))).toMatchObject({
      strokeAlign: StrokeAlign.inside,
      strokeWidth: 1,
      strokes,
    });
  });

  it('should carry the section corner radius over to the frame', () => {
    expect(convertSectionToFrame(buildSection({ cornerRadius: 2 })).cornerRadius).toBe(2);
  });
});
