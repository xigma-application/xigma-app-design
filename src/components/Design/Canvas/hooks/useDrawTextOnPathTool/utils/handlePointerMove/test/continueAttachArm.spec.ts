import { RefObject } from 'react';

// utils
import { continueAttachArm } from '../continueAttachArm';

const createStringRef = (value: string | null): RefObject<string | null> => ({ current: value });

describe('continueAttachArm', () => {
  it('should leave the armed attachment target alone while still under the slop tolerance', () => {
    // mock
    const attachTargetIdRef = createStringRef('node-1');

    // before
    continueAttachArm({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 0, zoom: 1 }, attachTargetIdRef);

    // result
    expect(attachTargetIdRef.current).toBe('node-1');
  });

  it('should disarm the attachment target once dragged past the slop tolerance', () => {
    // mock
    const attachTargetIdRef = createStringRef('node-1');

    // before — well past the default slop distance at zoom 1
    continueAttachArm({ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 0, y: 0, zoom: 1 }, attachTargetIdRef);

    // result
    expect(attachTargetIdRef.current).toBeNull();
  });

  it('should do nothing when no attachment target is armed', () => {
    // mock
    const attachTargetIdRef = createStringRef(null);

    // before
    continueAttachArm({ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 0, y: 0, zoom: 1 }, attachTargetIdRef);

    // result
    expect(attachTargetIdRef.current).toBeNull();
  });

  it('should scale the slop tolerance down with zoom, so the same screen-space drag disarms sooner when zoomed in', () => {
    // mock
    const attachTargetIdRef = createStringRef('node-1');

    // before — a world-space drag of 3 units is a bigger screen-space drag at 4x zoom
    continueAttachArm({ x: 0, y: 0 }, { x: 3, y: 0 }, { x: 0, y: 0, zoom: 4 }, attachTargetIdRef);

    // result
    expect(attachTargetIdRef.current).toBeNull();
  });
});
