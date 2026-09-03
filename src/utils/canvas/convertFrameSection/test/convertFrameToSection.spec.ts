// types
import { NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { convertFrameToSection } from '../convertFrameToSection';

const buildFrame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fill: '#ff0000',
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
      fill: '#ff0000',
      height: 100,
      hidden: undefined,
      id: 'frame-1',
      isMask: undefined,
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

  it('should carry over hidden, locked and isMask when set', () => {
    const frame = buildFrame({ hidden: true, isMask: true, locked: true });

    expect(convertFrameToSection(frame)).toMatchObject({ hidden: true, isMask: true, locked: true });
  });

  it('should drop the frame-only guides, strokeColor and strokeWidth fields', () => {
    const frame = buildFrame({ guides: [{ axis: 'x', id: 'guide-1', position: 50 }], strokeColor: '#000000', strokeWidth: 2 });

    const section = convertFrameToSection(frame);

    expect(section).not.toHaveProperty('guides');
    expect(section).not.toHaveProperty('strokeColor');
    expect(section).not.toHaveProperty('strokeWidth');
  });
});
