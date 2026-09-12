import { render, screen } from '@testing-library/react';

// components
import SliderLegends from './SliderLegends';

describe('SliderLegends snapshots', () => {
  it('should render a legend positioned from its mark value', () => {
    // before
    const { asFragment } = render(<SliderLegends marks={[{ label: 'iOS', value: 60 }]} max={100} min={0} />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('SliderLegends behaviors', () => {
  it('should render the label text for each given mark', () => {
    // before
    render(
      <SliderLegends
        marks={[
          { label: 'iOS', value: 60 },
          { label: 'Sharp', value: 0 },
        ]}
        max={100}
        min={0}
      />,
    );

    // result
    expect(screen.getByText('iOS')).toBeInTheDocument();
    expect(screen.getByText('Sharp')).toBeInTheDocument();
  });
});
