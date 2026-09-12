import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import CornerSmoothingPopover from './CornerSmoothingPopover';
import { TooltipProvider } from 'shared';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

const renderPopover = (onClose: TFunc = vi.fn()): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <CornerSmoothingPopover onClose={onClose} />
      </TooltipProvider>
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

const read = (id: string): TRectangleNode => selectActivePage(store.getState()).nodes[id] as TRectangleNode;

describe('CornerSmoothingPopover snapshots', () => {
  it('should render the header, slider, value field, and iOS preview', () => {
    // before
    const { asFragment } = renderPopover();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('CornerSmoothingPopover behaviors', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should render the header title and the iOS preview label', () => {
    // before
    renderPopover();

    // result
    expect(screen.getByText('Corner smoothing')).toBeInTheDocument();
    expect(screen.getByText('iOS')).toBeInTheDocument();
  });

  it('should call onClose when the header close button is clicked', () => {
    // mock
    const onClose = vi.fn();

    // before
    renderPopover(onClose);

    // action
    fireEvent.click(screen.getByLabelText('Close'));

    // result
    expect(onClose).toHaveBeenCalled();
  });

  it('should start at 0% and commit a typed value on blur', () => {
    // before
    const id = addAndSelectRectangle();

    renderPopover();

    const getInput = (): HTMLInputElement => screen.getByRole('textbox', { name: 'Corner smoothing value' }) as HTMLInputElement;

    expect(getInput().value).toBe('0%');

    // action — the input remounts (key={defaultValue}) once the value commits, so re-query it
    fireEvent.change(getInput(), { target: { value: '60' } });
    fireEvent.blur(getInput());

    // result
    expect(getInput().value).toBe('60%');
    expect(read(id).cornerSmoothing).toBe(0.6);
  });

  it('should clamp a typed value above 100 down to 100', () => {
    // before
    const id = addAndSelectRectangle();

    renderPopover();

    const getInput = (): HTMLInputElement => screen.getByRole('textbox', { name: 'Corner smoothing value' }) as HTMLInputElement;

    // action
    fireEvent.change(getInput(), { target: { value: '1000' } });
    fireEvent.blur(getInput());

    // result
    expect(getInput().value).toBe('100%');
    expect(read(id).cornerSmoothing).toBe(1);
  });
});
