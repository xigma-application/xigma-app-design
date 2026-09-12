import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import AppearanceSection from './AppearanceSection';
import { TooltipProvider } from 'shared';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

const renderAppearanceSection = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <CanvasRefsProvider>
        <TooltipProvider>
          <AppearanceSection />
        </TooltipProvider>
      </CanvasRefsProvider>
    </Provider>,
  );

const addRectangle = (overrides: Partial<TRectangleNode> = {}): string => {
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

  return rootOrder[rootOrder.length - 1];
};

const read = (id: string): TRectangleNode => selectActivePage(store.getState()).nodes[id] as TRectangleNode;

describe('AppearanceSection snapshots', () => {
  it('should render the collapsed opacity and corner radius fields', () => {
    // before
    const id = addRectangle({ cornerRadius: 4, opacity: 0.5 });

    store.dispatch(setSelection([id]));

    const { asFragment } = renderAppearanceSection();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('AppearanceSection behaviors', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should render the section label and both field labels', () => {
    const id = addRectangle();

    store.dispatch(setSelection([id]));
    renderAppearanceSection();

    expect(screen.getByText('Appearance')).toBeInTheDocument();
    expect(screen.getByText('Opacity')).toBeInTheDocument();
    expect(screen.getByText('Corner radius')).toBeInTheDocument();
  });

  it('should display the opacity as a percentage', () => {
    const id = addRectangle({ opacity: 0.42 });

    store.dispatch(setSelection([id]));
    renderAppearanceSection();

    expect((screen.getByLabelText('Opacity') as HTMLInputElement).value).toBe('42%');
  });

  it('should commit a typed opacity percentage on blur', () => {
    const id = addRectangle();

    store.dispatch(setSelection([id]));
    renderAppearanceSection();

    const input = screen.getByLabelText('Opacity');

    fireEvent.change(input, { target: { value: '30' } });
    fireEvent.blur(input);

    expect(read(id).opacity).toBe(0.3);
  });

  it('should show a numeric corner radius when every corner matches', () => {
    const id = addRectangle({ cornerRadius: 6 });

    store.dispatch(setSelection([id]));
    renderAppearanceSection();

    expect((screen.getByLabelText('Corner radius') as HTMLInputElement).value).toBe('6');
  });

  it('should show "Mixed" when the corners differ', () => {
    const id = addRectangle({ cornerRadius: 0, cornerRadiusTopLeft: 1, cornerRadiusTopRight: 3 });

    store.dispatch(setSelection([id]));
    renderAppearanceSection();

    expect((screen.getByLabelText('Corner radius') as HTMLInputElement).value).toBe('Mixed');
  });

  it('should apply a typed corner radius to all four corners on blur', () => {
    const id = addRectangle();

    store.dispatch(setSelection([id]));
    renderAppearanceSection();

    const input = screen.getByLabelText('Corner radius');

    fireEvent.change(input, { target: { value: '12' } });
    fireEvent.blur(input);

    expect(read(id)).toMatchObject({
      cornerRadius: 12,
      cornerRadiusBottomLeft: 12,
      cornerRadiusBottomRight: 12,
      cornerRadiusTopLeft: 12,
      cornerRadiusTopRight: 12,
    });
  });

  it('should reveal the four individual corner radius inputs when toggled', () => {
    const id = addRectangle({ cornerRadiusBottomLeft: 2, cornerRadiusBottomRight: 4, cornerRadiusTopLeft: 1, cornerRadiusTopRight: 3 });

    store.dispatch(setSelection([id]));
    renderAppearanceSection();

    fireEvent.click(screen.getByLabelText('Individual corner radius'));

    expect((screen.getByLabelText('Top left corner radius') as HTMLInputElement).value).toBe('1');
    expect((screen.getByLabelText('Top right corner radius') as HTMLInputElement).value).toBe('3');
    expect((screen.getByLabelText('Bottom left corner radius') as HTMLInputElement).value).toBe('2');
    expect((screen.getByLabelText('Bottom right corner radius') as HTMLInputElement).value).toBe('4');
  });

  it('should show the Corner smoothing button only once individual corners are revealed', () => {
    const id = addRectangle();

    store.dispatch(setSelection([id]));
    renderAppearanceSection();

    expect(screen.queryByLabelText('Corner smoothing')).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Individual corner radius'));

    expect(screen.getByLabelText('Corner smoothing')).toBeInTheDocument();
  });

  it('should move only one corner when editing an individual field', () => {
    const id = addRectangle({ cornerRadius: 4, cornerRadiusTopRight: 4 });

    store.dispatch(setSelection([id]));
    renderAppearanceSection();

    fireEvent.click(screen.getByLabelText('Individual corner radius'));

    const topLeftInput = screen.getByLabelText('Top left corner radius');

    fireEvent.change(topLeftInput, { target: { value: '9' } });
    fireEvent.blur(topLeftInput);

    expect(read(id).cornerRadiusTopLeft).toBe(9);
    expect(read(id).cornerRadiusTopRight).toBe(4);
  });

  it('should toggle the node hidden state and swap the eye icon label', () => {
    const id = addRectangle();

    store.dispatch(setSelection([id]));
    renderAppearanceSection();

    fireEvent.click(screen.getByLabelText('Hide'));

    expect(read(id).hidden).toBe(true);
    expect(screen.getByLabelText('Show')).toBeInTheDocument();
  });

  it('should render the blend mode button', () => {
    const id = addRectangle();

    store.dispatch(setSelection([id]));
    renderAppearanceSection();

    expect(screen.getByLabelText('Apply blend mode')).toBeInTheDocument();
  });
});
