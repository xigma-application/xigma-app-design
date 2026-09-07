import { fireEvent, render } from '@testing-library/react';

// components
import ConstraintsPreview from './ConstraintsPreview';

// styles
import styles from './constraints-preview.module.scss';

// types
import { AlignmentHorizontal, AlignmentVertical } from 'types/design/enums';

const renderConstraintsPreview = (overrides: Partial<Parameters<typeof ConstraintsPreview>[0]> = {}): ReturnType<typeof render> =>
  render(<ConstraintsPreview alignment={{}} setHorizontal={vi.fn()} setVertical={vi.fn()} {...overrides} />);

describe('ConstraintsPreview snapshots', () => {
  it('should render the default left/top preview', () => {
    const { asFragment } = renderConstraintsPreview();

    expect(asFragment()).toMatchSnapshot();
  });

  it('should render an explicit right/bottom preview', () => {
    const { asFragment } = renderConstraintsPreview({
      alignment: { horizontal: AlignmentHorizontal.right, vertical: AlignmentVertical.bottom },
    });

    expect(asFragment()).toMatchSnapshot();
  });

  it('should render a center preview with no active ticks', () => {
    const { asFragment } = renderConstraintsPreview({
      alignment: { horizontal: AlignmentHorizontal.center, vertical: AlignmentVertical.center },
    });

    expect(asFragment()).toMatchSnapshot();
  });
});

describe('ConstraintsPreview behaviors', () => {
  it('should call setVertical(top) / setVertical(bottom) when the top / bottom ticks are clicked', () => {
    const setVertical = vi.fn();
    const { container } = renderConstraintsPreview({ setVertical });

    fireEvent.click(container.querySelector(`.${styles['ConstraintsPreview__tick--top']}`) as Element);
    fireEvent.click(container.querySelector(`.${styles['ConstraintsPreview__tick--bottom']}`) as Element);

    expect(setVertical).toHaveBeenNthCalledWith(1, AlignmentVertical.top);
    expect(setVertical).toHaveBeenNthCalledWith(2, AlignmentVertical.bottom);
  });

  it('should call setHorizontal(left) / setHorizontal(right) when the left / right ticks are clicked', () => {
    const setHorizontal = vi.fn();
    const { container } = renderConstraintsPreview({ setHorizontal });

    fireEvent.click(container.querySelector(`.${styles['ConstraintsPreview__tick--left']}`) as Element);
    fireEvent.click(container.querySelector(`.${styles['ConstraintsPreview__tick--right']}`) as Element);

    expect(setHorizontal).toHaveBeenNthCalledWith(1, AlignmentHorizontal.left);
    expect(setHorizontal).toHaveBeenNthCalledWith(2, AlignmentHorizontal.right);
  });

  it('should call setHorizontal(center) when the horizontal crosshair target is clicked', () => {
    const setHorizontal = vi.fn();
    const { container } = renderConstraintsPreview({ setHorizontal });

    const crosses = container.querySelectorAll(`.${styles.ConstraintsPreview__node__cross}`);

    fireEvent.click(crosses[0]);

    expect(setHorizontal).toHaveBeenCalledWith(AlignmentHorizontal.center);
  });

  it('should call setVertical(center) when the vertical crosshair target is clicked', () => {
    const setVertical = vi.fn();
    const { container } = renderConstraintsPreview({ alignment: { horizontal: AlignmentHorizontal.center }, setVertical });

    const crosses = container.querySelectorAll(`.${styles.ConstraintsPreview__node__cross}`);

    fireEvent.click(crosses[1]);

    expect(setVertical).toHaveBeenCalledWith(AlignmentVertical.center);
  });

  it('should lock the vertical crosshair target and unlock the horizontal one before horizontal is centred', () => {
    const { container } = renderConstraintsPreview();
    const crosses = container.querySelectorAll(`.${styles.ConstraintsPreview__node__cross}`);

    expect(crosses[0].className).not.toContain(styles['ConstraintsPreview__node__cross--locked']);
    expect(crosses[1].className).toContain(styles['ConstraintsPreview__node__cross--locked']);
  });

  it('should hand the lock over to the horizontal crosshair target once horizontal is centred', () => {
    const { container } = renderConstraintsPreview({ alignment: { horizontal: AlignmentHorizontal.center } });
    const crosses = container.querySelectorAll(`.${styles.ConstraintsPreview__node__cross}`);

    expect(crosses[0].className).toContain(styles['ConstraintsPreview__node__cross--locked']);
    expect(crosses[1].className).not.toContain(styles['ConstraintsPreview__node__cross--locked']);
  });
});
