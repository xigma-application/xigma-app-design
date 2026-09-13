import { fireEvent, render, screen } from '@testing-library/react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { Provider } from 'react-redux';

// components
import BlendModeMenu from './BlendModeMenu';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

const renderBlendModeMenu = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <PopoverPrimitive.Root open>
        <BlendModeMenu />
      </PopoverPrimitive.Root>
    </Provider>,
  );

const addAndSelectRectangle = (): string => {
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
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());
  const id = rootOrder[rootOrder.length - 1];

  store.dispatch(setSelection([id]));

  return id;
};

describe('BlendModeMenu snapshots', () => {
  it('should render every blend mode option grouped with separators', () => {
    // before
    const { asFragment } = renderBlendModeMenu();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('BlendModeMenu behaviors', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should render every blend mode option', () => {
    // before
    renderBlendModeMenu();

    // result
    [
      'Pass through',
      'Normal',
      'Darken',
      'Multiply',
      'Plus darker',
      'Color burn',
      'Lighten',
      'Screen',
      'Plus lighter',
      'Color dodge',
      'Overlay',
      'Soft light',
      'Hard light',
      'Difference',
      'Exclusion',
      'Hue',
      'Saturation',
      'Color',
      'Luminosity',
    ].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('should mark Pass through as selected by default, and no other option', () => {
    // before
    renderBlendModeMenu();
    const selectedItem = screen.getByText('Pass through').closest('div')!.parentElement!;
    const otherItem = screen.getByText('Normal').closest('div')!.parentElement!;

    // result — PopoverItem renders a Check icon with opacity 1 when selected, 0 otherwise
    expect(selectedItem.querySelector('span[style*="opacity: 1"]')).not.toBeNull();
    expect(otherItem.querySelector('span[style*="opacity: 1"]')).toBeNull();
  });

  it('should move the selection to the clicked option and commit it onto the node', () => {
    // before
    const id = addAndSelectRectangle();

    renderBlendModeMenu();

    // action
    fireEvent.click(screen.getByText('Multiply'));

    // result
    const selectedItem = screen.getByText('Multiply').closest('div')!.parentElement!;

    expect(selectedItem.querySelector('span[style*="opacity: 1"]')).not.toBeNull();
    expect((selectActivePage(store.getState()).nodes[id] as { blendMode?: string }).blendMode).toBe('multiply');
  });
});
