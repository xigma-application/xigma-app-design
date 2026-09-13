import { render, screen } from '@testing-library/react';

// components
import Body from './Body';
import { TooltipProvider } from 'shared';

// types
import { ColorPickerTab } from '../enums';

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
  canRemoveStop: false,
  flip: vi.fn(),
  removeStop: vi.fn(),
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

const renderBody = (activeTab: ColorPickerTab): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <Body activeTab={activeTab} alpha={100} colorModel={colorModel} gradientPanel={gradientPanel} />
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
});
