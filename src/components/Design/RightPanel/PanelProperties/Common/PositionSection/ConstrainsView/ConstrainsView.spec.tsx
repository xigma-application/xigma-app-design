import { render } from '@testing-library/react';

// components
import ConstrainsView from './ConstrainsView';

// types
import { AlignmentHorizontal, AlignmentVertical } from 'types/design/enums';

describe('ConstrainsView snapshots', () => {
  it('should default to left/top when there is no alignment', () => {
    const { asFragment } = render(<ConstrainsView alignment={undefined} />);

    expect(asFragment()).toMatchSnapshot();
  });

  it('should render the selected modifier', () => {
    const { asFragment } = render(<ConstrainsView alignment={undefined} selected />);

    expect(asFragment()).toMatchSnapshot();
  });

  it('should highlight the active horizontal and vertical anchors', () => {
    const { asFragment } = render(
      <ConstrainsView alignment={{ horizontal: AlignmentHorizontal.right, vertical: AlignmentVertical.bottom }} />,
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
