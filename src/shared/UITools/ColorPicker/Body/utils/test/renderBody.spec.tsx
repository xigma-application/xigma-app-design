import { render, screen } from '@testing-library/react';

// types
import { ColorPickerTab } from '../../../enums';
import { TBodyProps } from '../../types';

// utils
import { renderBody } from '../renderBody';

vi.mock('../../GradientPanel/GradientPanel', () => ({ default: (): string => 'GradientPanel' }));
vi.mock('../../ImagePanel/ImagePanel', () => ({ default: (): string => 'ImagePanel' }));
vi.mock('../../PatternPanel/PatternPanel', () => ({ default: (): string => 'PatternPanel' }));
vi.mock('../../SolidPanel/SolidPanel', () => ({ default: (): string => 'SolidPanel' }));
vi.mock('../../VideoPanel/VideoPanel', () => ({ default: (): string => 'VideoPanel' }));

const renderTab = (activeTab: ColorPickerTab): ReturnType<typeof render> =>
  render(<div data-testid="body">{renderBody({ activeTab } as TBodyProps)}</div>);

describe('renderBody', () => {
  it.each([
    [ColorPickerTab.gradient, 'GradientPanel'],
    [ColorPickerTab.pattern, 'PatternPanel'],
    [ColorPickerTab.image, 'ImagePanel'],
    [ColorPickerTab.video, 'VideoPanel'],
    [ColorPickerTab.solid, 'SolidPanel'],
  ])('should render the panel of the %s tab', (tab, panel) => {
    // before
    renderTab(tab);

    // result
    expect(screen.getByTestId('body')).toHaveTextContent(panel);
  });

  it('should render nothing for the shader tab', () => {
    // before
    renderTab(ColorPickerTab.shader);

    // result
    expect(screen.getByTestId('body')).toBeEmptyDOMElement();
  });
});
