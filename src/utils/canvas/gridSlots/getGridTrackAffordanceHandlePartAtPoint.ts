// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TGridTrackAffordanceHandlePart } from 'types/design/canvas/types';

const HANDLE_PARTS: TGridTrackAffordanceHandlePart[] = ['grip', 'value', 'chevron'];

const isPointInBand = (point: TPoint, band: TDraftRect): boolean =>
  point.x >= band.x && point.x <= band.x + band.width && point.y >= band.y && point.y <= band.y + band.height;

export const getGridTrackAffordanceHandlePartAtPoint = (
  point: TPoint,
  bands: Record<TGridTrackAffordanceHandlePart, TDraftRect>,
): TGridTrackAffordanceHandlePart | null => HANDLE_PARTS.find((part) => isPointInBand(point, bands[part])) ?? null;
