type TElapsedTimeUnit = 'days' | 'hours' | 'minutes' | 'months' | 'now' | 'weeks' | 'years';

type TElapsedTime = {
  count: number;
  unit: TElapsedTimeUnit;
};

const LARGER_UNITS = [
  { seconds: 60 * 60 * 24 * 365, unit: 'years' },
  { seconds: 60 * 60 * 24 * 30, unit: 'months' },
  { seconds: 60 * 60 * 24 * 7, unit: 'weeks' },
  { seconds: 60 * 60 * 24, unit: 'days' },
  { seconds: 60 * 60, unit: 'hours' },
] as const;

const getElapsedTime = (date: number, now: number = Date.now()): TElapsedTime => {
  const elapsedSeconds = Math.floor((now - date) / 1000);

  if (elapsedSeconds < 60) {
    return { count: 0, unit: 'now' };
  }

  const matchedUnit = LARGER_UNITS.find(({ seconds }) => elapsedSeconds >= seconds);

  if (matchedUnit) {
    return { count: Math.floor(elapsedSeconds / matchedUnit.seconds), unit: matchedUnit.unit };
  }

  return { count: Math.floor(elapsedSeconds / 60), unit: 'minutes' };
};

export const getLastDateLabel = (createdAt: number, t: TT, now: number = Date.now()): string => {
  const elapsedTime = getElapsedTime(createdAt, now);

  return elapsedTime.unit === 'now' ? t('common.timeAgo.now') : t(`common.timeAgo.${elapsedTime.unit}`, { count: elapsedTime.count });
};
