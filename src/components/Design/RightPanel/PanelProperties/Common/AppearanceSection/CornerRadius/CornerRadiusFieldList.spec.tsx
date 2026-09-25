import { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';

// components
import CornerRadiusFieldList from './CornerRadiusFieldList';

// types
import { TCornerRadiusField } from './hooks/useCornerRadius/types';

vi.mock('./CornerRadiusInput', () => ({
  default: ({ ariaLabel, e2eValue, value }: { ariaLabel: string; e2eValue: string; value: number }): ReactElement => (
    <span>{`${e2eValue}:${ariaLabel}:${value}`}</span>
  ),
}));

const field = (e2eValue: string, ariaLabel: string, value: number): TCornerRadiusField =>
  ({
    ariaLabel,
    e2eValue,
    iconName: 'Corners',
    onCommit: vi.fn(),
    onScrub: vi.fn(),
    scrubValue: value,
    tooltip: ariaLabel,
    value,
  }) as unknown as TCornerRadiusField;

describe('CornerRadiusFieldList behaviors', () => {
  it('should render one corner input per field', () => {
    // before
    render(<CornerRadiusFieldList fields={[field('top-left', 'Top left', 4), field('top-right', 'Top right', 8)]} />);

    // result
    expect(screen.getByText('top-left:Top left:4')).toBeInTheDocument();
    expect(screen.getByText('top-right:Top right:8')).toBeInTheDocument();
  });
});
