// others
import { SECTION_CORNER_RADIUS } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
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
      fill: '#ff0000',
      height: 100,
      hidden: undefined,
      id: 'frame-1',
      locked: undefined,
      name: 'Frame',
      parentId: 'parent-1',
      rotation: 0,
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

  it('should drop the frame-only guides, strokeColor and strokeWidth fields', () => {
    const frame = buildFrame({ guides: [{ axis: 'x', id: 'guide-1', position: 50 }], strokeColor: '#000000', strokeWidth: 2 });

    const section = convertFrameToSection(frame);

    expect(section).not.toHaveProperty('guides');
    expect(section).not.toHaveProperty('strokeColor');
    expect(section).not.toHaveProperty('strokeWidth');
  });

  it('should fall back to an empty string fill when the frame has no solid fill', () => {
    const frame = buildFrame({ fills: [] });

    expect(convertFrameToSection(frame).fill).toBe('');
  });

  it('should carry over the frame’s children instead of discarding them', () => {
    const frame = buildFrame({ childIds: ['a', 'b'] });

    expect(convertFrameToSection(frame).childIds).toEqual(['a', 'b']);
  });

  it('should keep the frame corner radius when it has one', () => {
    expect(convertFrameToSection(buildFrame({ cornerRadius: 12 })).cornerRadius).toBe(12);
  });
});
