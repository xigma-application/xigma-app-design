import { render, screen } from '@testing-library/react';

// components
import PanelHeader from './PanelHeader';
import { TooltipProvider } from 'shared';

const renderPanelHeader = (props: Partial<Parameters<typeof PanelHeader>[0]> = {}): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <PanelHeader buttons={<button type="button">buttons</button>} e2eValue="rectangle" label="Rectangle" {...props} />
    </TooltipProvider>,
  );

describe('PanelHeader snapshots', () => {
  it('should render the plain label variant', () => {
    // before
    const { asFragment } = renderPanelHeader();

    // result
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render the dropdown menu variant', () => {
    // before
    const { asFragment } = renderPanelHeader({ menu: <span>menu</span>, menuAriaLabel: 'Element type' });

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('PanelHeader behaviors', () => {
  it('should render the label and the trailing buttons', () => {
    // before
    renderPanelHeader();

    // result
    expect(screen.getByText('Rectangle')).toBeInTheDocument();
    expect(screen.getByText('buttons')).toBeInTheDocument();
  });

  it('should render the label inside a menu trigger when a menu is provided', () => {
    // before
    renderPanelHeader({ menu: <span>menu</span>, menuAriaLabel: 'Element type' });

    // result
    expect(screen.getByLabelText('Element type')).toBeInTheDocument();
    expect(screen.getByText('Rectangle')).toBeInTheDocument();
  });

  it('should not render a menu trigger when no menu is provided', () => {
    // before
    renderPanelHeader();

    // result
    expect(screen.queryByLabelText('Element type')).not.toBeInTheDocument();
  });
});
