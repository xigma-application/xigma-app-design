// utils
import { armHitOnPointerDown } from '../armHitOnPointerDown';

const armHitDragMock = vi.fn();

vi.mock('../../armHitDrag', () => ({ armHitDrag: (...args: unknown[]): unknown => armHitDragMock(...args) }));

const context = (hit: unknown): Record<string, unknown> => ({
  canvas: 'canvas',
  canvasRefs: 'refs',
  currentSelection: ['a'],
  dispatch: 'dispatch',
  event: 'event',
  hit,
  point: { x: 1, y: 2 },
  selectedNodes: ['node'],
  selectionRefs: { dragStateRef: 'dragRef' },
});

describe('armHitOnPointerDown', () => {
  it('should arm dragging the hit layer', () => {
    // before
    const result = armHitOnPointerDown(context({ id: 'hit' }) as never);

    // result
    expect(result).toBe(true);
    expect(armHitDragMock).toHaveBeenCalledWith(
      'canvas',
      'event',
      'dispatch',
      'dragRef',
      { id: 'hit' },
      ['a'],
      ['node'],
      { x: 1, y: 2 },
      'refs',
    );
  });

  it('should leave the pointer alone over empty space', () => {
    // mock
    armHitDragMock.mockClear();

    // result
    expect(armHitOnPointerDown(context(null) as never)).toBeUndefined();
    expect(armHitDragMock).not.toHaveBeenCalled();
  });
});
