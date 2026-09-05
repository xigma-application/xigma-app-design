// types
import { TPoint } from 'types/canvas';

export const pickOrigins = (origins: Record<string, TPoint>, ids: string[]): Record<string, TPoint> =>
  Object.fromEntries(ids.map((id) => [id, origins[id]]));
