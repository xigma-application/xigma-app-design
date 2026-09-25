// store
import { setVectorEditingNodeIds } from 'store/design/slice';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';

// utils
import { armVectorWidthPointOnPointerDown } from '../armVectorWidthPointOnPointerDown';

const shiftToggleMock = vi.fn();
const grabMock = vi.fn();
const createMock = vi.fn();
const labelMock = vi.fn();

vi.mock('../armVectorWidthRegulatorShiftToggle', () => ({
  armVectorWidthRegulatorShiftToggle: (...args: unknown[]): unknown => shiftToggleMock(...args),
}));
vi.mock('../armVectorWidthHandleGrab', () => ({ armVectorWidthHandleGrab: (...args: unknown[]): unknown => grabMock(...args) }));
vi.mock('../armVectorWidthPointCreate', () => ({ armVectorWidthPointCreate: (...args: unknown[]): unknown => createMock(...args) }));
vi.mock('../armVectorWidthLabelClick', () => ({ armVectorWidthLabelClick: (...args: unknown[]): unknown => labelMock(...args) }));
vi.mock('../../../../../../../utils/getEligibleVectorWidthNodes', () => ({ getEligibleVectorWidthNodes: (): string[] => ['eligible'] }));
vi.mock('../../../../../../../utils/getVectorWidthPointHandleAtPoint', () => ({
  getVectorWidthPointHandleAtPoint: (): string => 'handle-hit',
}));

const createContext = (
  activeTool: ToolName,
): Record<string, unknown> & { canvasRefs: { vectorEdit: { selectedVectorWidthHandlesRef: { current: unknown[] } } } } => ({
  activeTool,
  canvas: 'canvas',
  canvasRefs: { vectorEdit: { selectedVectorWidthHandlesRef: { current: ['old'] } } },
  event: 'event',
  point: { x: 1, y: 2 },
  setClassName: 'setClassName',
  viewport: { x: 0, y: 0, zoom: 1 },
});

describe('armVectorWidthPointOnPointerDown', () => {
  beforeEach(() => {
    [shiftToggleMock, grabMock, createMock, labelMock].forEach((mock) => mock.mockReset().mockReturnValue(undefined));
    store.dispatch(setVectorEditingNodeIds(['v']));
  });

  afterAll(() => {
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it.each([
    ['toggling a regulator', shiftToggleMock],
    ['grabbing a handle', grabMock],
    ['creating a point', createMock],
    ['clicking a width label', labelMock],
  ])('should claim the pointer when %s', (_label, mock) => {
    // mock
    mock.mockReturnValue(true);

    // result
    expect(armVectorWidthPointOnPointerDown(createContext(ToolName.variableWidth) as never)).toBe(true);
  });

  it('should pass the regulator hit on to the handlers', () => {
    // mock
    const ctx = createContext(ToolName.variableWidth);

    // before
    armVectorWidthPointOnPointerDown(ctx as never);

    // result
    expect(shiftToggleMock).toHaveBeenCalledWith(ctx.canvasRefs, 'event', 'handle-hit');
    expect(createMock).toHaveBeenCalledWith(
      'canvas',
      ctx.canvasRefs,
      'event',
      { x: 1, y: 2 },
      'setClassName',
      expect.any(Object),
      ['eligible'],
      ctx.viewport,
    );
  });

  it('should clear the width handle selection on a press that hits nothing', () => {
    // mock
    const ctx = createContext(ToolName.variableWidth);

    // before
    const result = armVectorWidthPointOnPointerDown(ctx as never);

    // result
    expect(result).toBeUndefined();
    expect(ctx.canvasRefs.vectorEdit.selectedVectorWidthHandlesRef.current).toEqual([]);
  });

  it('should leave the pointer alone with another tool or nothing being edited', () => {
    // result
    expect(armVectorWidthPointOnPointerDown(createContext(ToolName.move) as never)).toBeUndefined();
    store.dispatch(setVectorEditingNodeIds([]));
    expect(armVectorWidthPointOnPointerDown(createContext(ToolName.variableWidth) as never)).toBeUndefined();
    expect(shiftToggleMock).not.toHaveBeenCalled();
  });
});
