import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';

// components
import ToolDropdown from './ToolDropdown';

// store
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';

describe('ToolDropdown snapshots', () => {
  it('should render ToolDropdown', () => {
    // before
    const { asFragment } = render(
      <Provider store={store}>
        <ToolDropdown tool={ToolName.default} />
      </Provider>,
    );

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('ToolDropdown behaviors', () => {
  it('should show the current tool when the trigger is clicked', async () => {
    // mock
    const user = userEvent.setup();

    // before
    render(
      <Provider store={store}>
        <ToolDropdown tool={ToolName.frame} />
      </Provider>,
    );

    // action
    await user.click(screen.getByRole('button', { name: 'frame options' }));

    // result
    expect(screen.getByText('Frame')).toBeInTheDocument();
    expect(screen.getByText('F')).toBeInTheDocument();
  });

  it('should set the active tool when the item is clicked', async () => {
    // mock
    const user = userEvent.setup();

    // before
    render(
      <Provider store={store}>
        <ToolDropdown tool={ToolName.frame} />
      </Provider>,
    );

    // action
    await user.click(screen.getByRole('button', { name: 'frame options' }));
    await user.click(screen.getByText('Frame'));

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.frame);
  });

  it('should list every tool in the rectangle group and select the last shape tool used', async () => {
    // mock
    const user = userEvent.setup();

    // before
    render(
      <Provider store={store}>
        <ToolDropdown tool={ToolName.rectangle} />
      </Provider>,
    );

    // action
    await user.click(screen.getByRole('button', { name: 'rectangle options' }));
    await user.click(screen.getByText('Ellipse'));

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.ellipse);
    expect(store.getState().design.lastShapeTool).toBe(ToolName.ellipse);
  });

  it('should list every tool in the frame group and select the last frame tool used', async () => {
    // mock
    const user = userEvent.setup();

    // before
    render(
      <Provider store={store}>
        <ToolDropdown tool={ToolName.frame} />
      </Provider>,
    );

    // action
    await user.click(screen.getByRole('button', { name: 'frame options' }));
    await user.click(screen.getByText('Section'));

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.section);
    expect(store.getState().design.lastFrameTool).toBe(ToolName.section);
  });

  it('should list only the tool itself when it has no configured group', async () => {
    // mock
    const user = userEvent.setup();

    // before
    render(
      <Provider store={store}>
        <ToolDropdown tool={ToolName.line} />
      </Provider>,
    );

    // action
    await user.click(screen.getByRole('button', { name: 'line options' }));

    // result
    expect(screen.getByText('Line')).toBeInTheDocument();
    expect(screen.queryByText('Frame')).not.toBeInTheDocument();
  });

  it('should list every tool in the default group and select the last mouse tool used', async () => {
    // mock
    const user = userEvent.setup();

    // before
    render(
      <Provider store={store}>
        <ToolDropdown tool={ToolName.default} />
      </Provider>,
    );

    // action
    await user.click(screen.getByRole('button', { name: 'default options' }));
    await user.click(screen.getByText('Hand tool'));

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.hand);
    expect(store.getState().design.lastMouseTool).toBe(ToolName.hand);
  });
});
