import { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';

// components
import PaddingFieldList from './PaddingFieldList';

// types
import { TPaddingField } from './hooks/useColumnPadding/types';

vi.mock('./PaddingInput', () => ({
  default: ({ ariaLabel, e2eValue, value }: { ariaLabel: string; e2eValue: string; value: number }): ReactElement => (
    <span>{`${e2eValue}:${ariaLabel}:${value}`}</span>
  ),
}));

const field = (e2eValue: string, labelKey: string, value: number): TPaddingField =>
  ({
    e2eValue,
    iconName: 'PaddingL',
    labelKey,
    onCommit: vi.fn(),
    onHoverEnd: vi.fn(),
    onHoverStart: vi.fn(),
    onScrub: vi.fn(),
    scrubValue: value,
    value,
  }) as unknown as TPaddingField;

describe('PaddingFieldList behaviors', () => {
  it('should render one padding input per field', () => {
    // before
    render(<PaddingFieldList fields={[field('padding-left', 'left', 4), field('padding-top', 'top', 8)]} />);

    // result
    expect(screen.getByText(/^padding-left:.*:4$/)).toBeInTheDocument();
    expect(screen.getByText(/^padding-top:.*:8$/)).toBeInTheDocument();
  });
});
