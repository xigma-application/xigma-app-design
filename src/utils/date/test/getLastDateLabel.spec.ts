import { getLastDateLabel } from '../getLastDateLabel';

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

const t = vi.fn((key: string, options?: { count: number }) => (options ? `${key}:${options.count}` : key)) as unknown as TT;

describe('getLastDateLabel', () => {
  it('should translate "now" for anything under a minute', () => {
    // before
    const result = getLastDateLabel(1000, t, 1000 + 59 * SECOND);

    // result
    expect(result).toBe('common.timeAgo.now');
  });

  it('should translate minutes with the elapsed count once at least a minute has elapsed', () => {
    // before
    const result = getLastDateLabel(0, t, 5 * MINUTE);

    // result
    expect(result).toBe('common.timeAgo.minutes:5');
  });

  it('should translate hours with the elapsed count once at least an hour has elapsed', () => {
    // before
    const result = getLastDateLabel(0, t, 3 * HOUR);

    // result
    expect(result).toBe('common.timeAgo.hours:3');
  });

  it('should translate days with the elapsed count once at least a day has elapsed', () => {
    // before
    const result = getLastDateLabel(0, t, 5 * DAY);

    // result
    expect(result).toBe('common.timeAgo.days:5');
  });

  it('should translate weeks with the elapsed count once at least a week has elapsed', () => {
    // before
    const result = getLastDateLabel(0, t, 2 * WEEK);

    // result
    expect(result).toBe('common.timeAgo.weeks:2');
  });

  it('should translate months with the elapsed count once at least 4 weeks have elapsed', () => {
    // before
    const result = getLastDateLabel(0, t, 60 * DAY);

    // result
    expect(result).toBe('common.timeAgo.months:2');
  });

  it('should translate years with the elapsed count once at least 12 months have elapsed', () => {
    // before
    const result = getLastDateLabel(0, t, 400 * DAY);

    // result
    expect(result).toBe('common.timeAgo.years:1');
  });

  it('should default "now" to the current time when not provided', () => {
    // before
    const result = getLastDateLabel(Date.now(), t);

    // result
    expect(result).toBe('common.timeAgo.now');
  });
});
