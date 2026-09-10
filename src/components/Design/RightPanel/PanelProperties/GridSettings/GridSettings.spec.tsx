import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactElement } from 'react';

// components
import GridSettings from './GridSettings';
import { TooltipProvider } from 'shared';

// store
import { addNode, setGridSettingsPanelOpen, setSelection, updateNode } from 'store/design/slice';
import { selectActivePage, selectIsGridSettingsPanelOpen } from 'store/design/selectors';
import { store } from 'store';

// types
import { LayoutMode, NodeType } from 'types/design/enums';

const renderGridSettings = (ui: ReactElement = <GridSettings />): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>{ui}</TooltipProvider>
    </Provider>,
  );

const selectGridFrame = (): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#fff',
      height: 200,
      layoutMode: LayoutMode.grid,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 200,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());
  const frameId = rootOrder[rootOrder.length - 1];

  store.dispatch(updateNode({ changes: { gridColumnCount: 3, gridRowCount: 2 }, id: frameId }));
  store.dispatch(setSelection([frameId]));
  store.dispatch(setGridSettingsPanelOpen(true));

  return frameId;
};

describe('GridSettings', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setGridSettingsPanelOpen(false));
  });

  it('should render the header and one row per column and row track', () => {
    selectGridFrame();

    renderGridSettings();

    expect(screen.getByText('Grid')).toBeInTheDocument();
    expect(screen.getByText('Columns')).toBeInTheDocument();
    expect(screen.getByText('Rows')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Reorder track' })).toHaveLength(5);
  });

  it('should close the panel from the header', () => {
    selectGridFrame();

    renderGridSettings();
    fireEvent.click(screen.getByRole('button', { name: 'Close grid settings' }));

    expect(selectIsGridSettingsPanelOpen(store.getState())).toBe(false);
  });

  it('should match the snapshot', () => {
    selectGridFrame();

    const { asFragment } = renderGridSettings();

    expect(asFragment()).toMatchSnapshot();
  });
});
