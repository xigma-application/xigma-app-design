// store
import { AppStore } from 'store';

// utils
import { updatePenPreview } from '../updatePenPreview';

const resolveMock = vi.fn();
const activeMock = vi.fn();
const noActiveMock = vi.fn();

vi.mock('../../resolvePenTargetNode', () => ({ resolvePenTargetNode: (...args: unknown[]): unknown => resolveMock(...args) }));
vi.mock('../updateActiveVertexPreview', () => ({ updateActiveVertexPreview: (...args: unknown[]): unknown => activeMock(...args) }));
vi.mock('../updateNoActiveVertexPreview', () => ({ updateNoActiveVertexPreview: (...args: unknown[]): unknown => noActiveMock(...args) }));

const buildStore = (penActiveVertexId: string | null): AppStore =>
  ({
    getState: () => ({
      design: {
        activePageId: 'p',
        pages: { p: { nodes: { n: { id: 'n' } }, vectorEditingNodeIds: [] } },
        penActiveVertexId,
        vectorEditingNodeIds: ['n', 'other'],
      },
    }),
  }) as unknown as AppStore;

const ref = <T>(current: T): { current: T } => ({ current });

const run = (appStore: AppStore): { handleIsSnapped: { current: boolean }; handlePosition: { current: unknown } } => {
  const handlePosition = ref<unknown>({ x: 1, y: 1 });
  const handleIsSnapped = ref(true);

  updatePenPreview(
    { x: 5, y: 5 },
    { x: 0, y: 0, zoom: 2 },
    true,
    appStore,
    ref(null),
    ref(null),
    handlePosition as never,
    handleIsSnapped,
    ref(null),
    ref(null),
    ref(false),
    ref(null),
    vi.fn(),
  );

  return { handleIsSnapped, handlePosition };
};

describe('updatePenPreview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reset the dragged handle and preview the next segment from the active vertex', () => {
    // mock
    resolveMock.mockReturnValue({ id: 'n' });

    // before
    const { handleIsSnapped, handlePosition } = run(buildStore('v1'));

    // result
    expect(handlePosition.current).toBeNull();
    expect(handleIsSnapped.current).toBe(false);
    expect(activeMock).toHaveBeenCalledTimes(1);
    expect(activeMock.mock.calls[0][3]).toBe('v1');
    expect(activeMock.mock.calls[0][11]).toEqual(['other']);
    expect(noActiveMock).not.toHaveBeenCalled();
  });

  it('should preview a fresh vertex when no vertex is active or no node is under the pen', () => {
    // mock
    resolveMock.mockReturnValueOnce({ id: 'n' }).mockReturnValueOnce(null);

    // before
    run(buildStore(null));
    run(buildStore('v1'));

    // result
    expect(noActiveMock).toHaveBeenCalledTimes(2);
    expect(activeMock).not.toHaveBeenCalled();
  });
});
