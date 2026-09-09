import { render, screen } from '@testing-library/react';

// components
import PopoverAutoLayoutSettingsPreview, { TPopoverAutoLayoutSettingsPreviewProps } from './PopoverAutoLayoutSettingsPreview';

// types
import { CanvasStacking, InsideStroke } from 'types/design/enums';

const NO_PREVIEW: TPopoverAutoLayoutSettingsPreviewProps = {
  alignTextBaseline: null,
  autoSpacing: null,
  canvasStacking: null,
  insideStroke: null,
  layout: null,
};

describe('PopoverAutoLayoutSettingsPreview', () => {
  it('should render the preview placeholder label when nothing is being previewed', () => {
    // before
    render(<PopoverAutoLayoutSettingsPreview {...NO_PREVIEW} />);

    // result
    expect(screen.getByText('Preview')).toBeInTheDocument();
  });

  it('should render the inside stroke preview visual instead of the placeholder when a value is passed', () => {
    // before
    const { container } = render(<PopoverAutoLayoutSettingsPreview {...NO_PREVIEW} insideStroke={InsideStroke.included} />);

    // result
    expect(screen.queryByText('Preview')).not.toBeInTheDocument();
    expect(container.querySelector('[class*="PreviewInsideStroke"]')).not.toBeNull();
  });

  it('should render the canvas stacking preview visual instead of the placeholder when a value is passed', () => {
    // before
    const { container } = render(<PopoverAutoLayoutSettingsPreview {...NO_PREVIEW} canvasStacking={CanvasStacking.lastOnTop} />);

    // result
    expect(screen.queryByText('Preview')).not.toBeInTheDocument();
    expect(container.querySelector('[class*="PreviewCanvasStacking"]')).not.toBeNull();
  });

  it('should render the align text baseline preview visual instead of the placeholder when a value is passed', () => {
    // before
    const { container } = render(<PopoverAutoLayoutSettingsPreview {...NO_PREVIEW} alignTextBaseline="on" />);

    // result
    expect(screen.queryByText('Preview')).not.toBeInTheDocument();
    expect(container.querySelector('[class*="PreviewAlignTextBaseline"]')).not.toBeNull();
  });

  it('should render the auto spacing preview visual instead of the placeholder when a value is passed', () => {
    // before
    const { container } = render(<PopoverAutoLayoutSettingsPreview {...NO_PREVIEW} autoSpacing="between" />);

    // result
    expect(screen.queryByText('Preview')).not.toBeInTheDocument();
    expect(container.querySelector('[class*="PreviewAutoSpacing"]')).not.toBeNull();
  });

  it('should render the layout preview visual instead of the placeholder when a value is passed', () => {
    // before
    const { container } = render(<PopoverAutoLayoutSettingsPreview {...NO_PREVIEW} layout="legacy" />);

    // result
    expect(screen.queryByText('Preview')).not.toBeInTheDocument();
    expect(container.querySelector('[class*="PreviewLayout"]')).not.toBeNull();
  });

  it('should prioritize the inside stroke preview over the canvas stacking preview when both are set', () => {
    // before
    const { container } = render(
      <PopoverAutoLayoutSettingsPreview {...NO_PREVIEW} canvasStacking={CanvasStacking.lastOnTop} insideStroke={InsideStroke.included} />,
    );

    // result
    expect(container.querySelector('[class*="PreviewInsideStroke"]')).not.toBeNull();
    expect(container.querySelector('[class*="PreviewCanvasStacking"]')).toBeNull();
  });
});
