import { ReactElement } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

// components
import SelectionColorRow from './SelectionColorRow';
import { TooltipProvider } from 'shared';

// types
import { BlendMode } from 'types/design/enums';
import { TGradientPaint, TSolidPaint } from 'types/design/paint/types';
import { TSelectionColorGroup } from '../types';

const { pickerProps } = vi.hoisted(() => ({ pickerProps: [] as Record<string, unknown>[] }));

vi.mock('shared', async (importOriginal) => {
  const original = await importOriginal<{ UITools: object }>();

  return {
    ...original,
    UITools: {
      ...original.UITools,
      ColorPickerInput: (props: Record<string, unknown>): ReactElement => {
        pickerProps.push(props);
        return <div />;
      },
    },
  };
});

const solid: TSolidPaint = { color: '#112233', opacity: 80, type: 'solid' };

const gradient = {
  end: { x: 1, y: 1 },
  opacity: 100,
  start: { x: 0, y: 0 },
  stops: [
    { color: '#000000', opacity: 100, position: 0 },
    { color: '#ffffff', opacity: 100, position: 1 },
  ],
  type: 'linear',
} as unknown as TGradientPaint;

const renderRow = (paint: TSolidPaint | TGradientPaint, isOpen: boolean): Record<string, TFunc> => {
  const handlers = { onChange: vi.fn(), onOpenChange: vi.fn(), onSelectNodes: vi.fn() };

  render(
    <TooltipProvider>
      <SelectionColorRow {...handlers} group={{ paint } as TSelectionColorGroup} isOpen={isOpen} selectionCount={2} />
    </TooltipProvider>,
  );

  return handlers;
};

describe('SelectionColorRow behaviors', () => {
  it('should edit a solid color and select the layers using it', () => {
    // before
    const { onChange, onOpenChange, onSelectNodes } = renderRow(solid, false);

    // find
    const props = pickerProps.at(-1) as Record<string, TFunc<unknown[]>>;

    // action
    props.onCommitAlpha(40);
    props.onTriggerClick();
    fireEvent.click(screen.getByLabelText('Select 2 items using this color'));

    // result
    expect(props).toMatchObject({ alpha: 80, blendMode: BlendMode.normal, initialGradient: undefined, initialOpen: false });
    expect(onChange).toHaveBeenCalledWith({ ...solid, opacity: 40 });
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(onSelectNodes).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText('Apply styles and variables')).toBeInTheDocument();
  });

  it('should commit a typed hex through the solid paint change', () => {
    // before
    const { onChange } = renderRow(solid, true);

    // action
    (pickerProps.at(-1)!.onCommitHex as TFunc<[string]>)('#445566');

    // result
    expect(pickerProps.at(-1)?.onTriggerClick).toBeUndefined();
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ color: '#445566', type: 'solid' }));
  });

  it('should seed the picker with the gradient of a gradient paint', () => {
    // before
    renderRow({ ...gradient, blendMode: BlendMode.multiply }, false);

    // result
    expect(pickerProps.at(-1)).toMatchObject({
      blendMode: BlendMode.multiply,
      initialGradient: { end: gradient.end, start: gradient.start, stops: gradient.stops, type: 'linear' },
    });
  });
});
