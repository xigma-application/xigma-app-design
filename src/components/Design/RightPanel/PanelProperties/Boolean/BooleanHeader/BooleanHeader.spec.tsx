import { ReactElement, ReactNode } from 'react';
import { render, screen } from '@testing-library/react';

// components
import BooleanHeader from './BooleanHeader';

// types
import { BooleanOperation } from 'types/design/enums';

const operationMock = vi.fn();

vi.mock('../../Common/PanelHeader/hooks/useBooleanOperation', () => ({
  useBooleanOperation: (): unknown => ({ operation: operationMock() }),
}));
vi.mock('../../Common/PanelHeader/PanelHeader', () => ({
  default: ({ buttons, e2eValue, label }: { buttons: ReactNode; e2eValue: string; label: string }): ReactElement => (
    <div data-e2e={e2eValue}>
      {label}
      {buttons}
    </div>
  ),
}));
vi.mock('../../Common/PanelHeader/PanelHeaderMaskButton', () => ({ default: (): ReactElement => <span>mask</span> }));
vi.mock('../../Common/PanelHeader/PanelHeaderBooleanButton', () => ({ default: (): ReactElement => <span>boolean</span> }));
vi.mock('../../Common/PanelHeader/PanelHeaderComponentButton', () => ({ default: (): ReactElement => <span>component</span> }));

describe('BooleanHeader behaviors', () => {
  it('should name the header after the boolean operation and show its buttons', () => {
    // mock
    operationMock.mockReturnValue(BooleanOperation.subtract);

    // before
    render(<BooleanHeader />);

    // result
    expect(screen.getByText('mask')).toBeInTheDocument();
    expect(screen.getByText('boolean')).toBeInTheDocument();
    expect(screen.getByText('component')).toBeInTheDocument();
    expect(screen.getByText(/subtract/i)).toBeInTheDocument();
  });
});
