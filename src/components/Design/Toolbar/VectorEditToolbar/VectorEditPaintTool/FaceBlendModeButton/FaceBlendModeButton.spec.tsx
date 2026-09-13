import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import FaceBlendModeButton from './FaceBlendModeButton';
import { TooltipProvider } from 'shared';

// store
import { DEFAULT_VECTOR_PAINT } from 'store/design/constants';
import { selectPaint } from 'store/design/selectors';
import { setPaint } from 'store/design/slice';
import { store } from 'store';

// types
import { BlendMode } from 'types/design/enums';

const renderFaceBlendModeButton = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <FaceBlendModeButton />
      </TooltipProvider>
    </Provider>,
  );

describe('FaceBlendModeButton', () => {
  beforeEach(() => {
    store.dispatch(setPaint(DEFAULT_VECTOR_PAINT));
  });

  it('should open the blend mode menu, excluding Pass through, when the trigger is clicked', () => {
    // before
    renderFaceBlendModeButton();

    // action
    fireEvent.click(screen.getByLabelText('Apply blend mode to face'));

    // result
    expect(screen.getByText('Normal')).toBeInTheDocument();
    expect(screen.getByText('Luminosity')).toBeInTheDocument();
    expect(screen.queryByText('Pass through')).not.toBeInTheDocument();
  });

  it('should highlight the trigger while the menu is open', () => {
    // before
    renderFaceBlendModeButton();
    const trigger = screen.getByLabelText('Apply blend mode to face');

    // result
    expect(trigger).toHaveAttribute('aria-pressed', 'false');

    // action
    fireEvent.click(trigger);

    // result
    expect(trigger).toHaveAttribute('aria-pressed', 'true');
  });

  it('should swap the trigger icon once a non-default blend mode is set on the tool paint', () => {
    // before
    const { container: defaultContainer } = renderFaceBlendModeButton();
    const defaultIcon = defaultContainer.querySelector('svg')?.outerHTML;

    store.dispatch(setPaint({ ...DEFAULT_VECTOR_PAINT, blendMode: BlendMode.multiply }));

    const { container: setContainer } = renderFaceBlendModeButton();

    // result
    const setIcon = setContainer.querySelector('svg')?.outerHTML;

    expect(setIcon).not.toBe(defaultIcon);
  });

  it('should dispatch the picked blend mode when an option is clicked', () => {
    // before
    renderFaceBlendModeButton();
    fireEvent.click(screen.getByLabelText('Apply blend mode to face'));

    // action
    fireEvent.click(screen.getByText('Multiply', { exact: true }));

    // result
    expect(selectPaint(store.getState()).blendMode).toBe(BlendMode.multiply);
  });

  it('should show the tooltip on focus', async () => {
    // before
    renderFaceBlendModeButton();

    // action
    fireEvent.focus(screen.getByLabelText('Apply blend mode to face'));

    // result
    expect(await screen.findAllByText('Apply blend mode to face', {}, { timeout: 2000 })).not.toHaveLength(0);
  });
});
