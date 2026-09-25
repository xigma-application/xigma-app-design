// others
import { SECTION_CORNER_RADIUS } from 'constant/canvas';

// types
import { NodeType, StrokeAlign } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { convertFrameToSection } from '../convertFrameToSection';

const buildFrame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
  height: 100,
  id: 'frame-1',
  name: 'Frame',
  parentId: 'parent-1',
  rotation: 0,
  type: NodeType.frame,
  width: 200,
  x: 10,
  y: 20,
  ...overrides,
});

describe('convertFrameToSection', () => {
  it('should carry over id, position, size, rotation, name and parent, switching only the type', () => {
    const frame = buildFrame();

    expect(convertFrameToSection(frame)).toEqual({
      childIds: [],
      cornerRadius: SECTION_CORNER_RADIUS,
      fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
      height: 100,
      hidden: undefined,
      id: 'frame-1',
      locked: undefined,
      name: 'Frame',
      parentId: 'parent-1',
      rotation: 0,
      strokeAlign: undefined,
      strokeWidth: undefined,
      strokes: undefined,
      type: NodeType.section,
      width: 200,
      x: 10,
      y: 20,
    });
  });

  it('should carry over hidden and locked when set', () => {
    const frame = buildFrame({ hidden: true, locked: true });

    expect(convertFrameToSection(frame)).toMatchObject({ hidden: true, locked: true });
  });

  it('should drop the frame-only guides and strokeColor fields', () => {
    const frame = buildFrame({ guides: [{ axis: 'x', id: 'guide-1', position: 50 }], strokeColor: '#000000' });

    const section = convertFrameToSection(frame);

    expect(section).not.toHaveProperty('guides');
    expect(section).not.toHaveProperty('strokeColor');
  });

  it('should carry over the frame fills and strokes', () => {
    const strokes = [{ color: '#00ff00', opacity: 50, type: 'solid' as const }];
    const frame = buildFrame({ fills: [], strokeAlign: StrokeAlign.outside, strokeWidth: 3, strokes });

    expect(convertFrameToSection(frame)).toMatchObject({ fills: [], strokeAlign: StrokeAlign.outside, strokeWidth: 3, strokes });
  });

  it('should carry over the frame’s children instead of discarding them', () => {
    const frame = buildFrame({ childIds: ['a', 'b'] });

    expect(convertFrameToSection(frame).childIds).toEqual(['a', 'b']);
  });

  it('should keep the frame corner radius when it has one', () => {
    expect(convertFrameToSection(buildFrame({ cornerRadius: 12 })).cornerRadius).toBe(12);
  });
});
