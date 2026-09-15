import { render, screen } from '@testing-library/react';

// components
import PatternSourcePreview from './PatternSourcePreview';

// types
import { TUsePatternSourcePickingResult } from '../../../hooks/usePatternSourcePicking';

const usePatternThumbnailMock = vi.fn();

vi.mock('./hooks/usePatternThumbnail', () => ({ usePatternThumbnail: (...args: unknown[]): unknown => usePatternThumbnailMock(...args) }));

const buildPatternSourcePicking = (overrides: Partial<TUsePatternSourcePickingResult> = {}): TUsePatternSourcePickingResult => ({
  close: vi.fn(),
  isActive: false,
  open: vi.fn(),
  ...overrides,
});

beforeEach(() => {
  usePatternThumbnailMock.mockReturnValue(null);
});

describe('PatternSourcePreview snapshots', () => {
  it('should render PatternSourcePreview without a thumbnail', () => {
    // before
    const { asFragment } = render(<PatternSourcePreview patternSourcePicking={buildPatternSourcePicking()} />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render PatternSourcePreview with a resolved thumbnail', () => {
    // mock
    usePatternThumbnailMock.mockReturnValue('data:image/png;base64,abc');

    // before
    const { asFragment } = render(<PatternSourcePreview patternSourcePicking={buildPatternSourcePicking()} sourceNodeId="node-a" />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('PatternSourcePreview behaviors', () => {
  it('should request the thumbnail for the given sourceNodeId', () => {
    // before
    render(<PatternSourcePreview patternSourcePicking={buildPatternSourcePicking()} sourceNodeId="node-a" />);

    // result
    expect(usePatternThumbnailMock).toHaveBeenCalledWith('node-a');
  });

  it("should paint the resolved thumbnail as the preview's background image", () => {
    // mock
    usePatternThumbnailMock.mockReturnValue('data:image/png;base64,abc');

    // before
    const { container } = render(<PatternSourcePreview patternSourcePicking={buildPatternSourcePicking()} sourceNodeId="node-a" />);

    // result
    expect(container.firstElementChild).toHaveStyle({ backgroundImage: 'url("data:image/png;base64,abc")' });
  });

  it('should render without a background image while no thumbnail has resolved yet', () => {
    // before
    const { container } = render(<PatternSourcePreview patternSourcePicking={buildPatternSourcePicking()} />);

    // result
    expect(container.firstElementChild).toHaveStyle({ backgroundImage: 'none' });
  });

  it('should show the source button directly, with no hover-only overlay, while there is no thumbnail yet', () => {
    // before
    const { container } = render(<PatternSourcePreview patternSourcePicking={buildPatternSourcePicking()} />);

    // result — nothing to hide the button behind when there's no image to protect from being covered
    expect(container.querySelector('[class*="PatternSourcePreview__overlay"]')).toBeNull();
    expect(screen.getByRole('button', { name: 'Select source...' })).toBeInTheDocument();
  });

  it('should wrap the source button in the hover-reveal overlay once a thumbnail exists', () => {
    // mock
    usePatternThumbnailMock.mockReturnValue('data:image/png;base64,abc');

    // before
    const { container } = render(<PatternSourcePreview patternSourcePicking={buildPatternSourcePicking()} sourceNodeId="node-a" />);
    const overlay = container.querySelector('[class*="PatternSourcePreview__overlay"]');

    // result — the button sits inside the overlay so it only surfaces on hover, instead of
    // permanently covering the thumbnail it's meant to let you preview
    expect(overlay).not.toBeNull();
    expect(overlay).toContainElement(screen.getByRole('button', { name: 'Select source...' }));
  });

  it('should not mark the overlay active while picking is inactive', () => {
    // before
    const { container } = render(<PatternSourcePreview patternSourcePicking={buildPatternSourcePicking({ isActive: false })} />);

    // result
    expect(container.firstElementChild?.className).not.toContain('PatternSourcePreview--active');
  });

  it('should keep the overlay marked active (not just on hover) while picking', () => {
    // before
    const { container } = render(<PatternSourcePreview patternSourcePicking={buildPatternSourcePicking({ isActive: true })} />);

    // result
    expect(container.firstElementChild?.className).toContain('PatternSourcePreview--active');
  });
});
