// types
import { TDrawSceneContext } from '../../types';
import { TPaint, TPatternPaint } from 'types/design/paint/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { resolvePatternPaintTile } from '../resolvePatternPaintTile';

const resolvePatternSourceTileMock = vi.fn();
const resolveFrozenPatternSourceTileMock = vi.fn();

vi.mock('../../resolvePatternSourceTile', () => ({
  resolvePatternSourceTile: (...args: unknown[]): unknown => resolvePatternSourceTileMock(...args),
}));
vi.mock('../../resolveFrozenPatternSourceTile', () => ({
  resolveFrozenPatternSourceTile: (...args: unknown[]): unknown => resolveFrozenPatternSourceTileMock(...args),
}));

const context = {} as TDrawSceneContext;
const refs = createCanvasRefs();
const basePattern = {
  alignmentIndex: 0,
  direction: 'horizontal',
  offsetX: 0,
  offsetY: 0,
  opacity: 100,
  scale: 100,
  spacingX: 0,
  spacingY: 0,
  tileType: 'rectangular',
  type: 'pattern',
} as const;

const resolve = (paint: TPaint): unknown => resolvePatternPaintTile(context, paint, {}, new Map(), refs, null, 0);

describe('resolvePatternPaintTile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resolvePatternSourceTileMock.mockReturnValue('live-tile');
    resolveFrozenPatternSourceTileMock.mockReturnValue('frozen-tile');
  });

  it('should return null for a non-pattern paint', () => {
    expect(resolve({ color: '#fff', opacity: 100, type: 'solid' })).toBeNull();
  });

  it('should resolve the live source tile when the pattern has a sourceNodeId', () => {
    expect(resolve({ ...basePattern, sourceNodeId: 'src' })).toBe('live-tile');
    expect(resolvePatternSourceTileMock).toHaveBeenCalledWith(context, 'src', {}, expect.any(Map), refs, null, 0);
  });

  it('should fall back to the frozen snapshot when there is no sourceNodeId', () => {
    const frozenSourceSnapshot = { height: 1, nodes: [], width: 1 } as unknown as TPatternPaint['frozenSourceSnapshot'];

    expect(resolve({ ...basePattern, frozenSourceSnapshot } as TPaint)).toBe('frozen-tile');
  });

  it('should return null for a pattern with neither a source nor a snapshot', () => {
    expect(resolve(basePattern)).toBeNull();
  });
});
