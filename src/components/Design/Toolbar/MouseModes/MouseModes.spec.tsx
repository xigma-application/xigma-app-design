import userEvent from '@testing-library/user-event';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import MouseModes from './MouseModes';
import { TooltipProvider } from 'shared';

// store
import { setActiveTool } from 'store/design/slice';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';

const renderMouseModes = (timeoutEnter?: number): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider timeoutEnter={timeoutEnter}>
        <MouseModes />
      </TooltipProvider>
    </Provider>,
  );

describe('MouseModes snapshots', () => {
  it('should render MouseModes', () => {
    // before
    const { asFragment } = renderMouseModes();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('MouseModes behaviors', () => {
  it('should change active tool', () => {
    // before
    const { getByRole } = renderMouseModes();

    // action
    fireEvent.click(getByRole('radio', { name: ToolName.frame }));

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.frame);
  });

  it('should show the last selected shape tool on the shared rectangle/ellipse button', () => {
    // before
    renderMouseModes();

    // action
    act(() => store.dispatch(setActiveTool(ToolName.ellipse)));

    // result
    expect(screen.getByRole('radio', { name: ToolName.ellipse })).toBeChecked();
  });

  it('should keep showing the last shape tool but unchecked once the tool resets to default', () => {
    // before
    renderMouseModes();

    // action
    act(() => store.dispatch(setActiveTool(ToolName.ellipse)));
    act(() => store.dispatch(setActiveTool(ToolName.default)));

    // result
    expect(screen.getByRole('radio', { name: ToolName.ellipse })).not.toBeChecked();
  });

  it('should show the last selected mouse tool on the shared default/hand button', () => {
    // before
    renderMouseModes();

    // action
    act(() => store.dispatch(setActiveTool(ToolName.hand)));

    // result
    expect(screen.getByRole('radio', { name: ToolName.hand })).toBeChecked();
  });

  it('should close the previously open dropdown when a different one is opened', async () => {
    // mock
    const user = userEvent.setup();

    // before
    renderMouseModes();

    // action
    await user.click(screen.getByRole('button', { name: 'default options' }));

    // result
    expect(screen.getByText('Hand tool')).toBeInTheDocument();

    // action
    await user.click(screen.getByRole('button', { name: 'frame options' }));

    // result — opening the frame dropdown must close the still-open default dropdown, not stack
    expect(screen.queryByText('Hand tool')).not.toBeInTheDocument();
    expect(screen.getByText('Frame')).toBeInTheDocument();
  });

  it('should show the tool label and keyboard shortcut in a tooltip when hovering a toolbar button', async () => {
    // mock
    const user = userEvent.setup();

    // before
    renderMouseModes(0);

    // action
    await user.hover(screen.getByRole('radio', { name: ToolName.frame }));

    // result — same label the dropdown shows, plus the raw (non-translated) keyboard shortcut
    expect(await screen.findByText('Frame')).toBeInTheDocument();
    expect(screen.getByText('F')).toBeInTheDocument();
  });

  it('should not show a shortcut hint for a tool with no keyboard shortcut', async () => {
    // mock
    const user = userEvent.setup();

    renderMouseModes(0);

    // before — Polygon has no keyboard shortcut, unlike Rectangle/Ellipse/Line
    act(() => store.dispatch(setActiveTool(ToolName.polygon)));

    // action
    await user.hover(screen.getByRole('radio', { name: ToolName.polygon }));

    // result
    expect(await screen.findByText('Polygon')).toBeInTheDocument();
    expect(document.querySelector('[class*="MouseModes__shortcut"]')).not.toBeInTheDocument();
  });
});
