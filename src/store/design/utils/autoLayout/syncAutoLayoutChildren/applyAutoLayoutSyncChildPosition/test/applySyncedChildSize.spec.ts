// types
import { NodeType } from 'types/design/enums';
import { TAutoLayoutChildPosition } from '../../../getAutoLayoutChildPositions/getAutoLayoutChildPositions';
import { TFrameNode, TLineNode, TRectangleNode } from 'types/design/types';
import { TImagePaint } from 'types/design/paint/types';

// utils
import { applySyncedChildSize } from '../applySyncedChildSize';

const frame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fills: [{ color: '#fff', opacity: 100, type: 'solid' }],
  height: 100,
  id: 'frame-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 100,
  x: 0,
  y: 0,
  ...overrides,
});

const rect = (overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fills: [{ color: '#fff', opacity: 100, type: 'solid' }],
  height: 20,
  id: 'a',
  name: 'Rectangle',
  parentId: 'frame-1',
  rotation: 0,
  type: NodeType.rectangle,
  width: 20,
  x: 0,
  y: 0,
  ...overrides,
});

const target = (overrides: Partial<TAutoLayoutChildPosition> = {}): TAutoLayoutChildPosition => ({
  height: 20,
  id: 'a',
  width: 20,
  x: 0,
  y: 0,
  ...overrides,
});

describe('applySyncedChildSize', () => {
  it('should resize the child and report the applied size when the target size differs and rotation matches', () => {
    // mock
    const child = rect({ height: 20, width: 20 });

    // before
    const applied = applySyncedChildSize(frame(), child, { height: 20, width: 20, x: 0, y: 0 }, target({ height: 40, width: 60 }));

    // result
    expect(applied).toEqual({ appliedHeight: 40, appliedWidth: 60 });
    expect(child).toMatchObject({ height: 40, width: 60 });
  });

  it('should report the bound’s own size and leave the child untouched when the target size matches the bound', () => {
    // mock
    const child = rect({ height: 20, width: 20 });

    // before
    const applied = applySyncedChildSize(frame(), child, { height: 20, width: 20, x: 0, y: 0 }, target({ height: 20, width: 20 }));

    // result
    expect(applied).toEqual({ appliedHeight: 20, appliedWidth: 20 });
    expect(child).toMatchObject({ height: 20, width: 20 });
  });

  it('should not resize the child when its rotation differs from the frame’s rotation', () => {
    // mock
    const child = rect({ height: 20, rotation: 45, width: 20 });

    // before
    const applied = applySyncedChildSize(
      frame({ rotation: 0 }),
      child,
      { height: 20, width: 20, x: 0, y: 0 },
      target({ height: 40, width: 60 }),
    );

    // result
    expect(applied).toEqual({ appliedHeight: 20, appliedWidth: 20 });
    expect(child).toMatchObject({ height: 20, width: 20 });
  });

  it('should not resize a non-box scene node (e.g. a line)', () => {
    // mock
    const child: TLineNode = {
      id: 'a',
      name: 'Line',
      parentId: 'frame-1',
      stroke: '#000',
      type: NodeType.line,
      x1: 0,
      x2: 20,
      y1: 0,
      y2: 0,
    };

    // before
    const applied = applySyncedChildSize(frame(), child, { height: 20, width: 20, x: 0, y: 0 }, target({ height: 40, width: 60 }));

    // result
    expect(applied).toEqual({ appliedHeight: 20, appliedWidth: 20 });
    expect(child).toMatchObject({ x1: 0, x2: 20 });
  });

  it('should scale a stored image crop proportionally along with the resize', () => {
    // mock — a crop that exactly matches the child's own bounds before the resize
    const paint: TImagePaint = {
      crop: { height: 20, rotation: 0, width: 20, x: 0, y: 0 },
      opacity: 100,
      ref: 'image-1',
      rotation: 0,
      scaleMode: 'fill',
      type: 'image',
    };
    const child = rect({ fills: [paint], height: 20, width: 20 });

    // before
    applySyncedChildSize(frame(), child, { height: 20, width: 20, x: 0, y: 0 }, target({ height: 40, width: 60 }));

    // result — the crop grew along with the child, still filling its new bounds exactly
    expect((child.fills[0] as TImagePaint).crop).toEqual({ height: 40, rotation: 0, width: 60, x: 0, y: 0 });
  });

  it('should default the crop scale factor to 1 when the child’s current width or height is zero', () => {
    // mock
    const paint: TImagePaint = {
      crop: { height: 10, rotation: 0, width: 0, x: 0, y: 0 },
      opacity: 100,
      ref: 'image-1',
      rotation: 0,
      scaleMode: 'fill',
      type: 'image',
    };
    const child = rect({ fills: [paint], height: 10, width: 0 });

    // before
    applySyncedChildSize(frame(), child, { height: 10, width: 0, x: 0, y: 0 }, target({ height: 20, width: 30 }));

    // result — width scale falls back to 1 (0 -> 0), height scale is the real 2x
    expect((child.fills[0] as TImagePaint).crop).toMatchObject({ height: 20, width: 0 });
  });

  it('should leave a solid-fill child’s fills untouched when resized', () => {
    // mock
    const solidFill = { color: '#00ff00', opacity: 100, type: 'solid' } as const;
    const child = rect({ fills: [solidFill], height: 20, width: 20 });

    // before
    applySyncedChildSize(frame(), child, { height: 20, width: 20, x: 0, y: 0 }, target({ height: 40, width: 60 }));

    // result
    expect(child.fills[0]).toEqual(solidFill);
  });
});
