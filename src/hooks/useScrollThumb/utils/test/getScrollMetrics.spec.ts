// others
import { AXIS_PROPS } from '../../constants';

// utils
import { getScrollMetrics } from '../getScrollMetrics';

const createElement = (props: Partial<Record<string, number>>): HTMLDivElement => {
  const element = document.createElement('div');

  Object.entries(props).forEach(([key, value]) => Object.defineProperty(element, key, { configurable: true, value }));

  return element;
};

describe('getScrollMetrics', () => {
  it('should derive the vertical size and start ratios', () => {
    // mock
    const element = createElement({ clientHeight: 84, scrollHeight: 336, scrollTop: 63 });

    // action
    const metrics = getScrollMetrics(element, AXIS_PROPS.y);

    // result — 84/336, 63/(336-84)
    expect(metrics.sizeRatio).toBeCloseTo(0.25);
    expect(metrics.startRatio).toBeCloseTo(0.25);
  });

  it('should derive the horizontal size and start ratios', () => {
    // mock
    const element = createElement({ clientWidth: 84, scrollLeft: 126, scrollWidth: 336 });

    // action
    const metrics = getScrollMetrics(element, AXIS_PROPS.x);

    // result
    expect(metrics.sizeRatio).toBeCloseTo(0.25);
    expect(metrics.startRatio).toBeCloseTo(0.5);
  });

  it('should report a full thumb at rest when there is no scrollable content', () => {
    // mock
    const element = createElement({ clientHeight: 0, scrollHeight: 0, scrollTop: 0 });

    // action
    const metrics = getScrollMetrics(element, AXIS_PROPS.y);

    // result
    expect(metrics).toEqual({ sizeRatio: 1, startRatio: 0 });
  });
});
