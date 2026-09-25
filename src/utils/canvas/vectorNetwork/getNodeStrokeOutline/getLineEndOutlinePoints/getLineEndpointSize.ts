// others
import { LINE_ENDPOINT_MIN_SIZE } from 'constant/canvas';

export const getLineEndpointSize = (halfWidth: number, factor: number): number => Math.max(LINE_ENDPOINT_MIN_SIZE, factor * halfWidth * 2);
