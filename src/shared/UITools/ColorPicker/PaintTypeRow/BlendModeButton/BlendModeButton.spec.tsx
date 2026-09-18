import { fireEvent, render, screen } from '@testing-library/react';

// components
import BlendModeButton from './BlendModeButton';
import { TooltipProvider } from 'shared';

// types
import { BlendMode } from 'types/design/enums';

const renderBlendModeButton = (value: BlendMode = BlendMode.normal, onChange: TFunc<[BlendMode]> = vi.fn()): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <BlendModeButton onChange={onChange} value={value} />
    </TooltipProvider>,
  );

describe('BlendModeButton', () => {
  it('should open the blend mode menu, excluding Pass through, when the trigger is clicked', () => {
    // before
    renderBlendModeButton();

    // action
    fireEvent.click(screen.getByLabelText('Apply blend mode to fill'));

    // result
    expect(screen.getByText('Normal')).toBeInTheDocument();
    expect(screen.getByText('Luminosity')).toBeInTheDocument();
    expect(screen.queryByText('Pass through')).not.toBeInTheDocument();
  });

  it('should highlight the trigger while the menu is open', () => {
    // before
    renderBlendModeButton();
    const trigger = screen.getByLabelText('Apply blend mode to fill');

    // result
    expect(trigger).toHaveAttribute('aria-pressed', 'false');

    // action
    fireEvent.click(trigger);

    // result
    expect(trigger).toHaveAttribute('aria-pressed', 'true');
  });

  it('should swap the trigger icon once a non-default blend mode value is passed in', () => {
    // before
    const { container: defaultContainer } = renderBlendModeButton(BlendMode.normal);
    const defaultIcon = defaultContainer.querySelector('svg')?.outerHTML;

    const { container: setContainer } = renderBlendModeButton(BlendMode.multiply);

    // result
    const setIcon = setContainer.querySelector('svg')?.outerHTML;

    expect(setIcon).not.toBe(defaultIcon);
  });

  it('should call onChange with the picked blend mode when an option is clicked', () => {
    // mock
    const onChange = vi.fn();

    // before
    renderBlendModeButton(BlendMode.normal, onChange);
    fireEvent.click(screen.getByLabelText('Apply blend mode to fill'));

    // action
    fireEvent.click(screen.getByText('Multiply', { exact: true }));

    // result
    expect(onChange).toHaveBeenCalledWith(BlendMode.multiply);
  });

  it('should show the tooltip on focus', async () => {
    // before
    renderBlendModeButton();

    // action
    fireEvent.focus(screen.getByLabelText('Apply blend mode to fill'));

    // result
    expect(await screen.findAllByText('Apply blend mode to fill', {}, { timeout: 2000 })).not.toHaveLength(0);
  });
});
