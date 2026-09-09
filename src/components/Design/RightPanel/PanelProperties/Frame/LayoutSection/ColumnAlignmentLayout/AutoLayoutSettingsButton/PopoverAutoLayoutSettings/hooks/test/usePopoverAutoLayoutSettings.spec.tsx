import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';

// hooks
import { usePopoverAutoLayoutSettings } from '../usePopoverAutoLayoutSettings';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { AlignTextBaseline, CanvasStacking, InsideStroke, LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const renderSettings = (
  onClose: TFunc = vi.fn(),
): ReturnType<typeof renderHook<ReturnType<typeof usePopoverAutoLayoutSettings>, unknown>> =>
  renderHook(() => usePopoverAutoLayoutSettings(onClose), { wrapper });

const addFrame = (): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: 100,
      layoutMode: LayoutMode.horizontal,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 100,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const read = (id: string): TFrameNode => selectActivePage(store.getState()).nodes[id] as TFrameNode;

describe('usePopoverAutoLayoutSettings', () => {
  let frameId = '';

  beforeEach(() => {
    frameId = addFrame();
    store.dispatch(setSelection([frameId]));
  });

  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should default to the values shown in the mockup', () => {
    // before
    const { result } = renderSettings();

    // result
    expect(result.current.insideStrokeValue).toBe('included');
    expect(result.current.canvasStackingValue).toBe('lastOnTop');
    expect(result.current.alignTextBaselineValue).toBe('off');
    expect(result.current.autoSpacingValue).toBe('between');
    expect(result.current.layoutValue).toBe('updated');
  });

  it('should expose translated options for each dropdown field', () => {
    // before
    const { result } = renderSettings();

    // result
    expect(result.current.insideStrokeOptions.map((option) => option.value)).toEqual(['included', 'excluded']);
    expect(result.current.canvasStackingOptions.map((option) => option.value)).toEqual(['lastOnTop', 'firstOnTop']);
    expect(result.current.autoSpacingOptions.map((option) => option.value)).toEqual(['between', 'around', 'evenly']);
    expect(result.current.layoutOptions.map((option) => option.value)).toEqual(['updated', 'legacy']);
  });

  it('should expose an off/on toggle button pair for align text baseline', () => {
    // before
    const { result } = renderSettings();

    // result
    expect(result.current.alignTextBaselineToggleButtons.map((button) => [button.value, button.icon])).toEqual([
      ['off', 'Minus'],
      ['on', 'Check'],
    ]);
  });

  it('should update the inside stroke value when selected', () => {
    // before
    const { result } = renderSettings();

    // action
    act(() => result.current.onSelectInsideStroke(InsideStroke.excluded));

    // result
    expect(result.current.insideStrokeValue).toBe('excluded');
  });

  it('should persist the selected inside stroke value to the selected frame node', () => {
    // before
    const { result } = renderSettings();

    // action
    act(() => result.current.onSelectInsideStroke(InsideStroke.excluded));

    // result
    expect(read(frameId).insideStroke).toBe(InsideStroke.excluded);
  });

  it('should not throw and should fall back to the default value when no frame is selected', () => {
    // before
    store.dispatch(setSelection([]));
    const { result } = renderSettings();

    // action
    act(() => result.current.onSelectInsideStroke(InsideStroke.excluded));

    // result
    expect(result.current.insideStrokeValue).toBe('included');
  });

  it('should update the canvas stacking value when selected', () => {
    // before
    const { result } = renderSettings();

    // action
    act(() => result.current.onSelectCanvasStacking(CanvasStacking.firstOnTop));

    // result
    expect(result.current.canvasStackingValue).toBe('firstOnTop');
  });

  it('should persist the selected canvas stacking value to the selected frame node', () => {
    // before
    const { result } = renderSettings();

    // action
    act(() => result.current.onSelectCanvasStacking(CanvasStacking.firstOnTop));

    // result
    expect(read(frameId).canvasStacking).toBe(CanvasStacking.firstOnTop);
  });

  it('should not throw and should fall back to the default canvas stacking value when no frame is selected', () => {
    // before
    store.dispatch(setSelection([]));
    const { result } = renderSettings();

    // action
    act(() => result.current.onSelectCanvasStacking(CanvasStacking.firstOnTop));

    // result
    expect(result.current.canvasStackingValue).toBe('lastOnTop');
  });

  it('should update the align text baseline value on change', () => {
    // before
    const { result } = renderSettings();

    // action
    act(() => result.current.onChangeAlignTextBaseline('on'));

    // result
    expect(result.current.alignTextBaselineValue).toBe('on');
  });

  it('should persist the selected align text baseline value to the selected frame node', () => {
    // before
    const { result } = renderSettings();

    // action
    act(() => result.current.onChangeAlignTextBaseline('on'));

    // result
    expect(read(frameId).alignTextBaseline).toBe(AlignTextBaseline.on);
  });

  it('should not throw and should fall back to the default align text baseline value when no frame is selected', () => {
    // before
    store.dispatch(setSelection([]));
    const { result } = renderSettings();

    // action
    act(() => result.current.onChangeAlignTextBaseline('on'));

    // result
    expect(result.current.alignTextBaselineValue).toBe('off');
  });

  it('should update the auto spacing value when selected', () => {
    // before
    const { result } = renderSettings();

    // action
    act(() => result.current.onSelectAutoSpacing('evenly'));

    // result
    expect(result.current.autoSpacingValue).toBe('evenly');
  });

  it('should update the layout value when selected', () => {
    // before
    const { result } = renderSettings();

    // action
    act(() => result.current.onSelectLayout('updated'));

    // result
    expect(result.current.layoutValue).toBe('updated');
  });

  it('should not preview inside stroke until it is hovered', () => {
    // before
    const { result } = renderSettings();

    // result
    expect(result.current.insideStrokePreviewValue).toBeNull();
  });

  it('should preview the current inside stroke value while hovered', () => {
    // before
    const { result } = renderSettings();

    // action
    act(() => result.current.onMouseEnterInsideStroke());

    // result
    expect(result.current.insideStrokePreviewValue).toBe('included');
  });

  it('should clear the preview when the pointer leaves', () => {
    // before
    const { result } = renderSettings();

    act(() => result.current.onMouseEnterInsideStroke());

    // action
    act(() => result.current.onMouseLeaveInsideStroke());

    // result
    expect(result.current.insideStrokePreviewValue).toBeNull();
  });

  it('should follow a selection made while still hovering', () => {
    // before
    const { result } = renderSettings();

    act(() => result.current.onMouseEnterInsideStroke());

    // action
    act(() => result.current.onSelectInsideStroke(InsideStroke.excluded));

    // result
    expect(result.current.insideStrokePreviewValue).toBe('excluded');
  });

  it('should preview a hovered dropdown option, taking priority over the row-level hover preview', () => {
    // before
    const { result } = renderSettings();

    act(() => result.current.onMouseEnterInsideStroke());

    // action — hovering a candidate option while the row is also hovered
    act(() => result.current.onHoverInsideStrokeOption(InsideStroke.excluded));

    // result
    expect(result.current.insideStrokePreviewValue).toBe('excluded');
  });

  it('should fall back to the row-level hover preview once the option hover ends', () => {
    // before
    const { result } = renderSettings();

    act(() => result.current.onMouseEnterInsideStroke());
    act(() => result.current.onHoverInsideStrokeOption(InsideStroke.excluded));

    // action
    act(() => result.current.onHoverInsideStrokeOption(null));

    // result — back to previewing the current, committed value
    expect(result.current.insideStrokePreviewValue).toBe('included');
  });

  it('should not preview canvas stacking until it is hovered', () => {
    // before
    const { result } = renderSettings();

    // result
    expect(result.current.canvasStackingPreviewValue).toBeNull();
  });

  it('should preview the current canvas stacking value while hovered', () => {
    // before
    const { result } = renderSettings();

    // action
    act(() => result.current.onMouseEnterCanvasStacking());

    // result
    expect(result.current.canvasStackingPreviewValue).toBe('lastOnTop');
  });

  it('should clear the canvas stacking preview when the pointer leaves', () => {
    // before
    const { result } = renderSettings();

    act(() => result.current.onMouseEnterCanvasStacking());

    // action
    act(() => result.current.onMouseLeaveCanvasStacking());

    // result
    expect(result.current.canvasStackingPreviewValue).toBeNull();
  });

  it('should preview a hovered canvas stacking dropdown option, taking priority over the row-level hover preview', () => {
    // before
    const { result } = renderSettings();

    act(() => result.current.onMouseEnterCanvasStacking());

    // action — hovering a candidate option while the row is also hovered
    act(() => result.current.onHoverCanvasStackingOption(CanvasStacking.firstOnTop));

    // result
    expect(result.current.canvasStackingPreviewValue).toBe('firstOnTop');
  });

  it('should fall back to the row-level canvas stacking hover preview once the option hover ends', () => {
    // before
    const { result } = renderSettings();

    act(() => result.current.onMouseEnterCanvasStacking());
    act(() => result.current.onHoverCanvasStackingOption(CanvasStacking.firstOnTop));

    // action
    act(() => result.current.onHoverCanvasStackingOption(null));

    // result — back to previewing the current, committed value
    expect(result.current.canvasStackingPreviewValue).toBe('lastOnTop');
  });

  it('should not preview align text baseline until it is hovered', () => {
    // before
    const { result } = renderSettings();

    // result
    expect(result.current.alignTextBaselinePreviewValue).toBeNull();
  });

  it('should preview the current align text baseline value while hovered', () => {
    // before
    const { result } = renderSettings();

    // action
    act(() => result.current.onMouseEnterAlignTextBaseline());

    // result
    expect(result.current.alignTextBaselinePreviewValue).toBe('off');
  });

  it('should clear the align text baseline preview when the pointer leaves', () => {
    // before
    const { result } = renderSettings();

    act(() => result.current.onMouseEnterAlignTextBaseline());

    // action
    act(() => result.current.onMouseLeaveAlignTextBaseline());

    // result
    expect(result.current.alignTextBaselinePreviewValue).toBeNull();
  });

  it('should preview a hovered align text baseline toggle option, taking priority over the row-level hover preview', () => {
    // before
    const { result } = renderSettings();

    act(() => result.current.onMouseEnterAlignTextBaseline());

    // action — hovering a candidate option while the row is also hovered
    act(() => result.current.onHoverAlignTextBaselineOption('on'));

    // result
    expect(result.current.alignTextBaselinePreviewValue).toBe('on');
  });

  it('should fall back to the row-level align text baseline hover preview once the option hover ends', () => {
    // before
    const { result } = renderSettings();

    act(() => result.current.onMouseEnterAlignTextBaseline());
    act(() => result.current.onHoverAlignTextBaselineOption('on'));

    // action
    act(() => result.current.onHoverAlignTextBaselineOption(null));

    // result — back to previewing the current, committed value
    expect(result.current.alignTextBaselinePreviewValue).toBe('off');
  });

  it('should not preview auto spacing until it is hovered', () => {
    // before
    const { result } = renderSettings();

    // result
    expect(result.current.autoSpacingPreviewValue).toBeNull();
  });

  it('should preview the current auto spacing value while hovered', () => {
    // before
    const { result } = renderSettings();

    // action
    act(() => result.current.onMouseEnterAutoSpacing());

    // result
    expect(result.current.autoSpacingPreviewValue).toBe('between');
  });

  it('should clear the auto spacing preview when the pointer leaves', () => {
    // before
    const { result } = renderSettings();

    act(() => result.current.onMouseEnterAutoSpacing());

    // action
    act(() => result.current.onMouseLeaveAutoSpacing());

    // result
    expect(result.current.autoSpacingPreviewValue).toBeNull();
  });

  it('should preview a hovered auto spacing dropdown option, taking priority over the row-level hover preview', () => {
    // before
    const { result } = renderSettings();

    act(() => result.current.onMouseEnterAutoSpacing());

    // action — hovering a candidate option while the row is also hovered
    act(() => result.current.onHoverAutoSpacingOption('evenly'));

    // result
    expect(result.current.autoSpacingPreviewValue).toBe('evenly');
  });

  it('should fall back to the row-level auto spacing hover preview once the option hover ends', () => {
    // before
    const { result } = renderSettings();

    act(() => result.current.onMouseEnterAutoSpacing());
    act(() => result.current.onHoverAutoSpacingOption('evenly'));

    // action
    act(() => result.current.onHoverAutoSpacingOption(null));

    // result — back to previewing the current, committed value
    expect(result.current.autoSpacingPreviewValue).toBe('between');
  });

  it('should not preview layout until it is hovered', () => {
    // before
    const { result } = renderSettings();

    // result
    expect(result.current.layoutPreviewValue).toBeNull();
  });

  it('should preview the current layout value while hovered', () => {
    // before
    const { result } = renderSettings();

    // action
    act(() => result.current.onMouseEnterLayout());

    // result
    expect(result.current.layoutPreviewValue).toBe('updated');
  });

  it('should clear the layout preview when the pointer leaves', () => {
    // before
    const { result } = renderSettings();

    act(() => result.current.onMouseEnterLayout());

    // action
    act(() => result.current.onMouseLeaveLayout());

    // result
    expect(result.current.layoutPreviewValue).toBeNull();
  });

  it('should preview a hovered layout dropdown option, taking priority over the row-level hover preview', () => {
    // before
    const { result } = renderSettings();

    act(() => result.current.onMouseEnterLayout());

    // action — hovering a candidate option while the row is also hovered
    act(() => result.current.onHoverLayoutOption('legacy'));

    // result
    expect(result.current.layoutPreviewValue).toBe('legacy');
  });

  it('should fall back to the row-level layout hover preview once the option hover ends', () => {
    // before
    const { result } = renderSettings();

    act(() => result.current.onMouseEnterLayout());
    act(() => result.current.onHoverLayoutOption('legacy'));

    // action
    act(() => result.current.onHoverLayoutOption(null));

    // result — back to previewing the current, committed value
    expect(result.current.layoutPreviewValue).toBe('updated');
  });

  it('should call the provided onClose when closing', () => {
    // mock
    const onClose = vi.fn();

    // before
    const { result } = renderSettings(onClose);

    // action
    act(() => result.current.handleClose());

    // result
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
