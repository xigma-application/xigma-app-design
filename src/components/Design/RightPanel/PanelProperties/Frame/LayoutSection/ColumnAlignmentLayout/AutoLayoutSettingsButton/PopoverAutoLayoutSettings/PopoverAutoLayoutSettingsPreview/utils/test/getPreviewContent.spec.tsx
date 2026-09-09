import { render, screen } from '@testing-library/react';
import i18n from 'i18next';

// types
import { AlignTextBaseline, AutoSpacing, CanvasStacking, InsideStroke, LayoutVersion } from 'types/design/enums';

// utils
import { getPreviewContent, TPreviewValues } from '../getPreviewContent';

const t = i18n.t;

const NO_PREVIEW: TPreviewValues = { alignTextBaseline: null, autoSpacing: null, canvasStacking: null, insideStroke: null, layout: null };

describe('getPreviewContent', () => {
  it('should render the inside stroke preview when an inside stroke value is set', () => {
    // before
    const { container } = render(getPreviewContent({ ...NO_PREVIEW, insideStroke: InsideStroke.included }, t));

    // result
    expect(container.querySelector('[class*="PreviewInsideStroke"]')).not.toBeNull();
  });

  it('should render the canvas stacking preview when a canvas stacking value is set', () => {
    // before
    const { container } = render(getPreviewContent({ ...NO_PREVIEW, canvasStacking: CanvasStacking.lastOnTop }, t));

    // result
    expect(container.querySelector('[class*="PreviewCanvasStacking"]')).not.toBeNull();
  });

  it('should render the align text baseline preview when an align text baseline value is set', () => {
    // before
    const { container } = render(getPreviewContent({ ...NO_PREVIEW, alignTextBaseline: AlignTextBaseline.on }, t));

    // result
    expect(container.querySelector('[class*="PreviewAlignTextBaseline"]')).not.toBeNull();
  });

  it('should render the auto spacing preview when an auto spacing value is set', () => {
    // before
    const { container } = render(getPreviewContent({ ...NO_PREVIEW, autoSpacing: AutoSpacing.between }, t));

    // result
    expect(container.querySelector('[class*="PreviewAutoSpacing"]')).not.toBeNull();
  });

  it('should render the layout preview when a layout value is set', () => {
    // before
    const { container } = render(getPreviewContent({ ...NO_PREVIEW, layout: LayoutVersion.legacy }, t));

    // result
    expect(container.querySelector('[class*="PreviewLayout"]')).not.toBeNull();
  });

  it('should prioritize the inside stroke preview over the others when multiple values are set', () => {
    // before
    const { container } = render(
      getPreviewContent(
        {
          alignTextBaseline: AlignTextBaseline.on,
          autoSpacing: AutoSpacing.between,
          canvasStacking: CanvasStacking.lastOnTop,
          insideStroke: InsideStroke.included,
          layout: LayoutVersion.legacy,
        },
        t,
      ),
    );

    // result
    expect(container.querySelector('[class*="PreviewInsideStroke"]')).not.toBeNull();
    expect(container.querySelector('[class*="PreviewCanvasStacking"]')).toBeNull();
    expect(container.querySelector('[class*="PreviewAlignTextBaseline"]')).toBeNull();
    expect(container.querySelector('[class*="PreviewAutoSpacing"]')).toBeNull();
    expect(container.querySelector('[class*="PreviewLayout"]')).toBeNull();
  });

  it('should prioritize the canvas stacking preview over the align text baseline preview when both are set', () => {
    // before
    const { container } = render(
      getPreviewContent({ ...NO_PREVIEW, alignTextBaseline: AlignTextBaseline.on, canvasStacking: CanvasStacking.lastOnTop }, t),
    );

    // result
    expect(container.querySelector('[class*="PreviewCanvasStacking"]')).not.toBeNull();
    expect(container.querySelector('[class*="PreviewAlignTextBaseline"]')).toBeNull();
  });

  it('should prioritize the align text baseline preview over the auto spacing preview when both are set', () => {
    // before
    const { container } = render(
      getPreviewContent({ ...NO_PREVIEW, alignTextBaseline: AlignTextBaseline.on, autoSpacing: AutoSpacing.between }, t),
    );

    // result
    expect(container.querySelector('[class*="PreviewAlignTextBaseline"]')).not.toBeNull();
    expect(container.querySelector('[class*="PreviewAutoSpacing"]')).toBeNull();
  });

  it('should prioritize the auto spacing preview over the layout preview when both are set', () => {
    // before
    const { container } = render(getPreviewContent({ ...NO_PREVIEW, autoSpacing: AutoSpacing.between, layout: LayoutVersion.legacy }, t));

    // result
    expect(container.querySelector('[class*="PreviewAutoSpacing"]')).not.toBeNull();
    expect(container.querySelector('[class*="PreviewLayout"]')).toBeNull();
  });

  it('should render the placeholder label when no value is set', () => {
    // before
    render(getPreviewContent(NO_PREVIEW, t));

    // result
    expect(screen.getByText('Preview')).toBeInTheDocument();
  });
});
