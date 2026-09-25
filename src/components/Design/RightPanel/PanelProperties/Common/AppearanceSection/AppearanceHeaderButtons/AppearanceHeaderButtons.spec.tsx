import { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';

// components
import AppearanceHeaderButtons from './AppearanceHeaderButtons';

vi.mock('./VisibilityToggle', () => ({ default: (): ReactElement => <span>visibility</span> }));
vi.mock('./BlendModeButton/BlendModeButton', () => ({ default: (): ReactElement => <span>blend</span> }));

describe('AppearanceHeaderButtons snapshots', () => {
  it('should render the visibility toggle and the blend mode button', () => {
    // before
    render(<AppearanceHeaderButtons />);

    // result
    expect(screen.getByText('visibility')).toBeInTheDocument();
    expect(screen.getByText('blend')).toBeInTheDocument();
  });
});
