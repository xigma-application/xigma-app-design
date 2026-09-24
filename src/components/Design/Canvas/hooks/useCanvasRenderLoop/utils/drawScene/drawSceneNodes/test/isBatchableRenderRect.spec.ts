// types
import { TMaskRenderer } from '../types';
import { TSceneNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { glassBackdropStates } from '../glassBackdropStates';
import { isBatchableRenderRect } from '../isBatchableRenderRect';

const createRect = (overrides: Record<string, unknown> = {}): TSceneNode =>
  ({
    fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
    height: 10,
    id: 'r',
    name: 'r',
    parentId: null,
    rotation: 0,
    type: 'rectangle',
    width: 10,
    x: 0,
    y: 0,
    ...overrides,
  }) as unknown as TSceneNode;

const getRectBatchResourcesMock = vi.fn();

vi.mock('utils/canvas/drawRectBatch/getRectBatchResources', () => ({
  getRectBatchResources: (...args: unknown[]): unknown => getRectBatchResourcesMock(...args),
}));

const createRenderer = (refs = createCanvasRefs()): TMaskRenderer => ({ gl: {}, refs }) as unknown as TMaskRenderer;

describe('isBatchableRenderRect', () => {
  beforeEach(() => {
    getRectBatchResourcesMock.mockReturnValue({});
  });

  it('should accept a batchable shape when nothing overrides rendering', () => {
    // result
    expect(isBatchableRenderRect(createRenderer(), createRect())).toBe(true);
  });

  it('should reject a shape that cannot be batched', () => {
    // result
    expect(isBatchableRenderRect(createRenderer(), createRect({ strokeColor: '#000000', strokeWidth: 2 }))).toBe(false);
  });

  it('should reject a rectangle while a drag preview overrides rendering', () => {
    // mock
    const refs = createCanvasRefs();

    refs.transform.gridDropTargetRef.current = {} as never;

    // result
    expect(isBatchableRenderRect(createRenderer(refs), createRect())).toBe(false);
  });

  it('should reject a rectangle with a real blend mode', () => {
    // result
    expect(isBatchableRenderRect(createRenderer(), createRect({ blendMode: 'multiply' }))).toBe(false);
  });

  it('should reject a rectangle while a glass backdrop is being tracked', () => {
    // mock
    const renderer = createRenderer();

    glassBackdropStates.set(renderer, { backdrop: {} } as never);

    // result
    expect(isBatchableRenderRect(renderer, createRect())).toBe(false);
  });

  it('should reject a rectangle when the batch program is unavailable so the regular path draws it', () => {
    // mock
    getRectBatchResourcesMock.mockReturnValue(null);

    // result
    expect(isBatchableRenderRect(createRenderer(), createRect())).toBe(false);
  });
});
