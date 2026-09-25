import { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';

// components
import BooleanPanel from './Boolean';

vi.mock('./BooleanHeader/BooleanHeader', () => ({ default: (): ReactElement => <span>header</span> }));
vi.mock('../Common/PositionSection/PositionSection', () => ({ default: (): ReactElement => <span>position</span> }));
vi.mock('../Common/ColumnDimensions/ColumnDimensions', () => ({ default: (): ReactElement => <span>dimensions</span> }));
vi.mock('../Common/ColumnSpacing/ColumnSpacing', () => ({ default: (): ReactElement => <span>spacing</span> }));
vi.mock('../Common/AppearanceSection/AppearanceSection', () => ({
  default: ({ withCornerRadius }: { withCornerRadius: boolean }): ReactElement => <span>{`appearance radius:${withCornerRadius}`}</span>,
}));
vi.mock('../Common/FillSection/FillSection', () => ({ default: (): ReactElement => <span>fill</span> }));
vi.mock('../Common/StrokeSection/StrokeSection', () => ({ default: (): ReactElement => <span>stroke</span> }));
vi.mock('../Common/EffectsSection/EffectsSection', () => ({ default: (): ReactElement => <span>effects</span> }));
vi.mock('../Export/Export', () => ({ default: (): ReactElement => <span>export</span> }));

describe('BooleanPanel behaviors', () => {
  it('should show the boolean sections, without a corner radius', () => {
    // before
    render(<BooleanPanel />);

    // result
    ['header', 'position', 'dimensions', 'spacing', 'appearance radius:false', 'fill', 'stroke', 'effects', 'export'].forEach((text) =>
      expect(screen.getByText(text)).toBeInTheDocument(),
    );
    expect(screen.getByText('Layout')).toBeInTheDocument();
  });
});
