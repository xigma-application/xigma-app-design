type TElapsedTimeUnit = 'days' | 'hours' | 'minutes' | 'months' | 'now' | 'weeks' | 'years';

type TElapsedTime = {
  count: number;
  unit: TElapsedTimeUnit;
};

const getElapsedTime = (date: number, now: number = Date.now()): TElapsedTime => {
  const elapsedSeconds = Math.floor((now - date) / 1000);

  if (elapsedSeconds < 60) {
    return { count: 0, unit: 'now' };
  }

  const units = [
    { seconds: 60, unit: 'minutes' },
    { seconds: 60 * 60, unit: 'hours' },
    { seconds: 60 * 60 * 24, unit: 'days' },
    { seconds: 60 * 60 * 24 * 7, unit: 'weeks' },
    { seconds: 60 * 60 * 24 * 30, unit: 'months' },
    { seconds: 60 * 60 * 24 * 365, unit: 'years' },
  ] as const;

  for (let i = units.length - 1; i >= 0; i--) {
    const { unit, seconds } = units[i];

    if (elapsedSeconds >= seconds) {
      return {
        count: Math.floor(elapsedSeconds / seconds),
        unit,
      };
    }
  }

  return { count: 0, unit: 'now' };
};

export const getLastDateLabel = (createdAt: number, t: TT, now: number = Date.now()): string => {
  const elapsedTime = getElapsedTime(createdAt, now);

  return elapsedTime.unit === 'now' ? t('common.timeAgo.now') : t(`common.timeAgo.${elapsedTime.unit}`, { count: elapsedTime.count });
};
