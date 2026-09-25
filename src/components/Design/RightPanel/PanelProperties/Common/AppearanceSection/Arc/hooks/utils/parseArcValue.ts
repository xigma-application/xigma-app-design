export const parseArcValue = (raw: string): number | null => {
  const stripped = raw.trim().replace(/[^\d.-]/g, '');
  const parsed = Number(stripped);

  return stripped !== '' && !Number.isNaN(parsed) ? parsed : null;
};
