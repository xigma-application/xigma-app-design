import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import BlendModeButton from './BlendModeButton';
import { TooltipProvider } from 'shared';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { BlendMode, NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

const renderBlendModeButton = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <CanvasRefsProvider>
        <TooltipProvider>
          <BlendModeButton />
        </TooltipProvider>
      </CanvasRefsProvider>
    </Provider>,
  );

const addAndSelectRectangle = (overrides: Partial<TRectangleNode> = {}): string => {
  store.dispatch(
    addNode({
      fill: '#ff0000',
      height: 10,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 10,
      x: 0,
      y: 0,
      ...overrides,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());
  const id = rootOrder[rootOrder.length - 1];

  store.dispatch(setSelection([id]));

  return id;
};

const read = (id: string): TRectangleNode => selectActivePage(store.getState()).nodes[id] as TRectangleNode;

describe('BlendModeButton snapshots', () => {
  it('should render the trigger with the menu closed', () => {
    // before
    const { asFragment } = renderBlendModeButton();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('BlendModeButton behaviors', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should open the blend mode menu when the trigger is clicked at the default value', () => {
    // before
    renderBlendModeButton();

    // action
    fireEvent.click(screen.getByLabelText('Apply blend mode'));

    // result
    expect(screen.getByText('Pass through')).toBeInTheDocument();
    expect(screen.getByText('Luminosity')).toBeInTheDocument();
  });

  it('should swap the trigger icon once a non-default blend mode is set', () => {
    // before
    addAndSelectRectangle();

    const { container: defaultContainer } = renderBlendModeButton();
    const defaultIcon = defaultContainer.querySelector('svg')?.outerHTML;

    // action
    addAndSelectRectangle({ blendMode: BlendMode.multiply });

    const { container: setContainer } = renderBlendModeButton();
    const setIcon = setContainer.querySelector('svg')?.outerHTML;

    // result
    expect(setIcon).not.toBe(defaultIcon);
  });

  it('should reset a non-default blend mode to Pass through instead of opening the menu, on click', () => {
    // before
    const id = addAndSelectRectangle({ blendMode: BlendMode.multiply });

    renderBlendModeButton();

    // action
    fireEvent.click(screen.getByLabelText('Apply blend mode'));

    // result
    expect(read(id).blendMode).toBe(BlendMode.passThrough);
    expect(screen.queryByText('Luminosity')).not.toBeInTheDocument();
  });

  it('should show the Apply tooltip at the default value', async () => {
    // before
    addAndSelectRectangle();

    renderBlendModeButton();

    // action
    fireEvent.focus(screen.getByLabelText('Apply blend mode'));

    // result
    expect(await screen.findAllByText('Apply blend mode', {}, { timeout: 2000 })).not.toHaveLength(0);
  });

  it('should show the Remove tooltip once a blend mode is set', async () => {
    // before
    addAndSelectRectangle({ blendMode: BlendMode.multiply });

    renderBlendModeButton();

    // action
    fireEvent.focus(screen.getByLabelText('Apply blend mode'));

    // result
    expect(await screen.findAllByText('Remove blend mode', {}, { timeout: 2000 })).not.toHaveLength(0);
  });

  it('should open the menu on the next click once the value is back to default', () => {
    // before
    const id = addAndSelectRectangle({ blendMode: BlendMode.multiply });

    renderBlendModeButton();

    // action — first click resets to Pass through instead of opening
    fireEvent.click(screen.getByLabelText('Apply blend mode'));

    expect(read(id).blendMode).toBe(BlendMode.passThrough);

    // action — second click now opens the menu
    fireEvent.click(screen.getByLabelText('Apply blend mode'));

    // result
    expect(screen.getByText('Luminosity')).toBeInTheDocument();
  });
});
