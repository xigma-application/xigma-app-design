import { act, renderHook } from '@testing-library/react';
import { FocusEvent, ReactNode } from 'react';
import { Provider } from 'react-redux';

// hooks
import { useShapeStrokeSettings } from '../useShapeStrokeSettings';

// store
import { addNodes, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType, StrokeAlign, StrokeMode } from 'types/design/enums';
import { TEllipseNode } from 'types/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const makeEllipse = (id: string, overrides: Partial<TEllipseNode> = {}): TEllipseNode => ({
  fills: [],
  height: 50,
  id,
  name: id,
  parentId: null,
  rotation: 0,
  type: NodeType.ellipse,
  width: 50,
  x: 0,
  y: 0,
  ...overrides,
});

const selectEllipses = (ellipses: TEllipseNode[]): void => {
  store.dispatch(addNodes({ nodes: ellipses, rootIds: ellipses.map((ellipse) => ellipse.id) }));
  store.dispatch(setSelection(ellipses.map((ellipse) => ellipse.id)));
};

const getEllipse = (id: string): TEllipseNode => selectActivePage(store.getState()).nodes[id] as TEllipseNode;

const blurEvent = (value: string): FocusEvent<HTMLInputElement> =>
  ({ target: { defaultValue: 'initial', value } }) as unknown as FocusEvent<HTMLInputElement>;

describe('useShapeStrokeSettings', () => {
  it('should read a fresh ellipse as a 1px inside stroke', () => {
    // mock
    selectEllipses([makeEllipse('strokeEllipseFresh')]);

    // before
    const { result } = renderHook(() => useShapeStrokeSettings(NodeType.ellipse), { wrapper });

    // result
    expect(result.current).toMatchObject({ isNonBasicMode: false, isWeightMixed: false, position: StrokeAlign.inside, weight: 1 });
  });

  it('should fall back to the default weight without a selected ellipse', () => {
    // mock
    store.dispatch(setSelection([]));

    // before
    const { result } = renderHook(() => useShapeStrokeSettings(NodeType.ellipse), { wrapper });

    // result
    expect(result.current.weight).toBe(1);
  });

  it('should set the position and a typed weight on every selected ellipse', () => {
    // mock
    selectEllipses([makeEllipse('strokeEllipseA'), makeEllipse('strokeEllipseB', { strokeWidth: 3 })]);

    // before
    const { result } = renderHook(() => useShapeStrokeSettings(NodeType.ellipse), { wrapper });

    // action
    act(() => result.current.onPositionSelect(StrokeAlign.outside));
    act(() => result.current.onWeightBlur(blurEvent('6')));

    // result
    expect(getEllipse('strokeEllipseA')).toMatchObject({ strokeAlign: StrokeAlign.outside, strokeWidth: 6 });
    expect(getEllipse('strokeEllipseB')).toMatchObject({ strokeAlign: StrokeAlign.outside, strokeWidth: 6 });
  });

  it('should scrub every weight by the same amount between drag start and end', () => {
    // mock
    selectEllipses([
      makeEllipse('strokeEllipseC', { strokeWidth: 2 }),
      makeEllipse('strokeEllipseD', { strokeWidth: 5 }),
      makeEllipse('strokeEllipseG'),
    ]);

    // before
    const { result } = renderHook(() => useShapeStrokeSettings(NodeType.ellipse), { wrapper });

    // action
    act(() => {
      result.current.onWeightDragStart();
      result.current.onWeightScrub(4);
      result.current.onWeightDragEnd();
    });

    // result
    expect(getEllipse('strokeEllipseC').strokeWidth).toBe(4);
    expect(getEllipse('strokeEllipseD').strokeWidth).toBe(7);
    expect(getEllipse('strokeEllipseG').strokeWidth).toBe(3);
    expect(result.current.isWeightMixed).toBe(true);
  });

  it('should flag a non-basic and a mixed stroke mode', () => {
    // mock
    selectEllipses([makeEllipse('strokeEllipseE', { strokeMode: StrokeMode.brush }), makeEllipse('strokeEllipseF')]);

    // before
    const { result } = renderHook(() => useShapeStrokeSettings(NodeType.ellipse), { wrapper });

    // result
    expect(result.current.isNonBasicMode).toBe(true);
    expect(result.current.isStrokeModeMixed).toBe(true);
  });

  it('should read and set the stroke of the selected polygons', () => {
    // mock
    const polygon = {
      ...makeEllipse('strokePolygon'),
      flipX: false,
      flipY: false,
      sides: 3,
      type: NodeType.polygon,
    } as unknown as TEllipseNode;

    selectEllipses([polygon]);

    // before
    const { result } = renderHook(() => useShapeStrokeSettings(NodeType.polygon), { wrapper });

    // action
    act(() => result.current.onPositionSelect(StrokeAlign.outside));

    // result
    expect(getEllipse('strokePolygon').strokeAlign).toBe(StrokeAlign.outside);
  });
});
