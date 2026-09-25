import { act, renderHook } from '@testing-library/react';
import { FocusEvent, ReactNode } from 'react';
import { Provider } from 'react-redux';

// hooks
import { useLineStrokeSettings } from '../useLineStrokeSettings';

// store
import { addNodes, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { LineEndpoint, NodeType, StrokeAlign, StrokeMode } from 'types/design/enums';
import { TLineNode } from 'types/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const makeLine = (id: string, overrides: Partial<TLineNode> = {}): TLineNode => ({
  height: 0,
  id,
  name: id,
  parentId: null,
  rotation: 0,
  strokes: [],
  type: NodeType.line,
  width: 50,
  x: 0,
  y: 0,
  ...overrides,
});

const selectLines = (lines: TLineNode[]): void => {
  store.dispatch(addNodes({ nodes: lines, rootIds: lines.map((line) => line.id) }));
  store.dispatch(setSelection(lines.map((line) => line.id)));
};

const getLine = (id: string): TLineNode => selectActivePage(store.getState()).nodes[id] as TLineNode;

const blurEvent = (value: string): FocusEvent<HTMLInputElement> =>
  ({ target: { defaultValue: 'initial', value } }) as unknown as FocusEvent<HTMLInputElement>;

describe('useLineStrokeSettings', () => {
  it('should read the default weight and endpoints of a fresh line', () => {
    // mock
    selectLines([makeLine('strokeLineFresh')]);

    // before
    const { result } = renderHook(() => useLineStrokeSettings(), { wrapper });

    // result
    expect(result.current.weight).toBe(1);
    expect(result.current.isWeightMixed).toBe(false);
    expect(result.current.startPoint).toBe(LineEndpoint.none);
    expect(result.current.endPoint).toBe(LineEndpoint.none);
  });

  it('should fall back to the default weight without a selected line', () => {
    // mock
    store.dispatch(setSelection([]));

    // before
    const { result } = renderHook(() => useLineStrokeSettings(), { wrapper });

    // result
    expect(result.current.weight).toBe(1);
  });

  it('should report mixed weights and endpoints across several lines', () => {
    // mock
    selectLines([
      makeLine('strokeLineMixedA', { endPoint: LineEndpoint.round, strokeWidth: 2 }),
      makeLine('strokeLineMixedB', { endPoint: LineEndpoint.square, strokeWidth: 4 }),
    ]);

    // before
    const { result } = renderHook(() => useLineStrokeSettings(), { wrapper });

    // result
    expect(result.current.weight).toBe(2);
    expect(result.current.isWeightMixed).toBe(true);
    expect(result.current.endPoint).toBeUndefined();
  });

  it('should write the chosen start and end points to every selected line', () => {
    // mock
    selectLines([makeLine('strokeLineEndA'), makeLine('strokeLineEndB')]);

    // before
    const { result } = renderHook(() => useLineStrokeSettings(), { wrapper });

    // action
    act(() => {
      result.current.onStartPointSelect(LineEndpoint.circleArrow);
      result.current.onEndPointSelect(LineEndpoint.diamondArrow);
    });

    // result
    expect(getLine('strokeLineEndA')).toMatchObject({ endPoint: LineEndpoint.diamondArrow, startPoint: LineEndpoint.circleArrow });
    expect(getLine('strokeLineEndB')).toMatchObject({ endPoint: LineEndpoint.diamondArrow, startPoint: LineEndpoint.circleArrow });
  });

  it('should commit a typed weight and restore the field for an unchanged or invalid one', () => {
    // mock
    selectLines([makeLine('strokeLineWeight', { strokeWidth: 2 })]);
    const typed = blurEvent('5');
    const unchanged = blurEvent('2');
    const invalid = blurEvent('abc');

    // before
    const { result } = renderHook(() => useLineStrokeSettings(), { wrapper });

    // action
    act(() => {
      result.current.onWeightBlur(unchanged);
      result.current.onWeightBlur(invalid);
      result.current.onWeightBlur(typed);
    });

    // result
    expect(getLine('strokeLineWeight').strokeWidth).toBe(5);
    expect(unchanged.target.value).toBe('initial');
    expect(invalid.target.value).toBe('initial');
  });

  it('should scrub every line weight by the same delta inside one history gesture', () => {
    // mock
    selectLines([makeLine('strokeLineScrubA', { strokeWidth: 2 }), makeLine('strokeLineScrubB')]);

    // before
    const { result } = renderHook(() => useLineStrokeSettings(), { wrapper });

    // action
    act(() => {
      result.current.onWeightDragStart();
      result.current.onWeightScrub(5);
      result.current.onWeightDragEnd();
    });

    // result
    expect(getLine('strokeLineScrubA').strokeWidth).toBe(5);
    expect(getLine('strokeLineScrubB').strokeWidth).toBe(4);
  });

  it('should read the shared position and stroke modes and write a picked position to every line', () => {
    // mock
    selectLines([
      makeLine('strokeLineModeA', { strokeAlign: StrokeAlign.outside, strokeMode: StrokeMode.brush }),
      makeLine('strokeLineModeB', { strokeAlign: StrokeAlign.outside, strokeMode: StrokeMode.brush }),
    ]);

    // before
    const { result } = renderHook(() => useLineStrokeSettings(), { wrapper });

    // result
    expect(result.current).toMatchObject({ isBrush: true, isNonBasicMode: true, isStrokeModeMixed: false, position: StrokeAlign.outside });

    // action
    act(() => {
      result.current.onPositionSelect(StrokeAlign.inside);
    });

    // result
    expect(getLine('strokeLineModeA').strokeAlign).toBe(StrokeAlign.inside);
  });

  it('should report mixed stroke modes and no brush for a brush and a plain line', () => {
    // mock
    selectLines([makeLine('strokeLineMixModeA', { strokeMode: StrokeMode.brush }), makeLine('strokeLineMixModeB')]);

    // before
    const { result } = renderHook(() => useLineStrokeSettings(), { wrapper });

    // result
    expect(result.current).toMatchObject({ isBrush: false, isStrokeModeMixed: true, position: StrokeAlign.center });
  });
});
