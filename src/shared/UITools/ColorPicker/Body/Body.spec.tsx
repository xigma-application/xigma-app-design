import { render, screen } from '@testing-library/react';

// components
import Body from './Body';
import { TooltipProvider } from 'shared';

// types
import { ColorPickerTab } from '../enums';

const usePatternThumbnailMock = vi.fn();

vi.mock('./PatternPanel/PatternSourcePreview/hooks/usePatternThumbnail', () => ({
  usePatternThumbnail: (...args: unknown[]): unknown => usePatternThumbnailMock(...args),
}));

const colorModel = {
  hex: '#ff0000',
  hsv: { h: 0, s: 100, v: 100 },
  setAlpha: vi.fn(),
  setHex: vi.fn(),
  setHsv: vi.fn(),
  setPreset: vi.fn(),
};

const gradientPanel = {
  addStop: vi.fn(),
  angle: 0,
  canAddStop: true,
  canRemoveStop: false,
  flip: vi.fn(),
  removeStop: vi.fn(),
  reset: vi.fn(),
  rotate: vi.fn(),
  selectStop: vi.fn(),
  selectedStopId: null,
  setStopColor: vi.fn(),
  setStopPosition: vi.fn(),
  setType: vi.fn(),
  stops: [
    { color: '#d9d9d9', id: 'stop-1', opacity: 100, position: 0 },
    { color: '#737373', id: 'stop-2', opacity: 100, position: 1 },
  ],
  type: 'gradient-linear' as const,
};

const patternPanel = {
  alignmentIndex: 0,
  direction: 'horizontal' as const,
  offsetX: 0,
  offsetY: 0,
  reset: vi.fn(),
  scale: 100,
  setAlignmentIndex: vi.fn(),
  setDirection: vi.fn(),
  setOffsetX: vi.fn(),
  setOffsetY: vi.fn(),
  setScale: vi.fn(),
  setSpacingX: vi.fn(),
  setSpacingY: vi.fn(),
  setTileType: vi.fn(),
  spacingX: 0,
  spacingY: 0,
  tileType: 'rectangular' as const,
};

const patternSourcePicking = { close: vi.fn(), isActive: false, open: vi.fn() };

const imagePanel = {
  contrast: 0,
  exposure: 0,
  fillMode: 'fill' as const,
  highlights: 0,
  imageUrl: null,
  saturation: 0,
  setContrast: vi.fn(),
  setExposure: vi.fn(),
  setFillMode: vi.fn(),
  setHighlights: vi.fn(),
  setImage: vi.fn(),
  setSaturation: vi.fn(),
  setShadows: vi.fn(),
  setTemperature: vi.fn(),
  setTint: vi.fn(),
  shadows: 0,
  temperature: 0,
  tint: 0,
};

const renderBody = (activeTab: ColorPickerTab, patternSourceNodeId?: string | null): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <Body
        activeTab={activeTab}
        alpha={100}
        colorModel={colorModel}
        gradientPanel={gradientPanel}
        imagePanel={imagePanel}
        patternPanel={patternPanel}
        patternSourceNodeId={patternSourceNodeId}
        patternSourcePicking={patternSourcePicking}
      />
    </TooltipProvider>,
  );

describe('Body snapshots', () => {
  it('should render Body with the solid panel', () => {
    // before
    const { asFragment } = renderBody(ColorPickerTab.solid);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('Body behaviors', () => {
  beforeEach(() => {
    usePatternThumbnailMock.mockReturnValue(null);
  });

  it('should forward patternSourceNodeId to the pattern panel', () => {
    // before
    renderBody(ColorPickerTab.pattern, 'node-a');

    // result
    expect(usePatternThumbnailMock).toHaveBeenCalledWith('node-a');
  });

  it('should render the solid panel for the solid tab', () => {
    // before
    renderBody(ColorPickerTab.solid);

    // result
    expect(screen.getByDisplayValue('ff0000')).toBeInTheDocument();
  });

  it('should render the gradient panel for the gradient tab', () => {
    // before
    renderBody(ColorPickerTab.gradient);

    // result
    expect(screen.getByText('Stops')).toBeInTheDocument();
  });

  it('should render the pattern panel for the pattern tab', () => {
    // before
    renderBody(ColorPickerTab.pattern);

    // result
    expect(screen.getByRole('button', { name: 'Select source...' })).toBeInTheDocument();
  });

  it('should render the image panel for the image tab', () => {
    // before
    renderBody(ColorPickerTab.image);

    // result
    expect(screen.getByRole('button', { name: 'Upload from computer' })).toBeInTheDocument();
  });
});
