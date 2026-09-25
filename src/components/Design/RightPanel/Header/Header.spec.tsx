import { ReactElement } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

// components
import Header from './Header';

vi.mock('./Avatar/Avatar', () => ({ default: (): ReactElement => <span>avatar</span> }));
vi.mock('./PresentShare/PresentShare', () => ({ default: (): ReactElement => <span>present</span> }));
vi.mock('./ZoomTrigger/ZoomTrigger', () => ({ default: (): ReactElement => <span>zoom</span> }));
vi.mock('shared/UITools/Tabs/Tabs', () => ({
  default: ({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: TFunc<[string]> }): ReactElement => (
    <button onClick={(): void => setActiveTab('prototype')} type="button">
      {activeTab}
    </button>
  ),
}));

describe('Header behaviors', () => {
  it('should show the avatar, share, view tabs and zoom, starting on the design tab', () => {
    // before
    render(<Header />);

    // result
    expect(screen.getByText('avatar')).toBeInTheDocument();
    expect(screen.getByText('present')).toBeInTheDocument();
    expect(screen.getByText('zoom')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('design');
  });

  it('should switch the active tab', () => {
    // before
    render(<Header />);

    // action
    fireEvent.click(screen.getByRole('button'));

    // result
    expect(screen.getByRole('button')).toHaveTextContent('prototype');
  });
});
