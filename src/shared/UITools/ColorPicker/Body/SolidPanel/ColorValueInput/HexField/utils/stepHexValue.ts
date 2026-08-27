// utils
import { clamp } from 'utils/math/clamp';

export type TStepHexValueResult = { hex: string; selectionEnd: number; selectionStart: number };

const DEFAULT_SEGMENT_LENGTH = 2;
const BYTE_LENGTH = 2;
const MAX_BYTE_VALUE = 0xff;

const getSegmentRange = (hexLength: number, selectionStart: number, selectionEnd: number): { segmentEnd: number; segmentStart: number } => {
  const selectionLength = selectionEnd - selectionStart;
  const targetLength = selectionLength === 0 ? DEFAULT_SEGMENT_LENGTH : selectionLength + (selectionLength % 2);
  const segmentStart = clamp(selectionStart, 0, Math.max(0, hexLength - targetLength));

  return { segmentEnd: segmentStart + targetLength, segmentStart };
};

const stepByte = (byte: string, delta: number): string =>
  clamp(parseInt(byte, 16) + delta, 0, MAX_BYTE_VALUE)
    .toString(16)
    .padStart(BYTE_LENGTH, '0');

const stepSegment = (segment: string, delta: number): string => {
  const byteCount = segment.length / BYTE_LENGTH;

  return Array.from({ length: byteCount }, (_, byteIndex) => segment.slice(byteIndex * BYTE_LENGTH, byteIndex * BYTE_LENGTH + BYTE_LENGTH))
    .map((byte) => stepByte(byte, delta))
    .join('');
};

export const stepHexValue = (hex: string, selectionStart: number, selectionEnd: number, delta: number): TStepHexValueResult => {
  const { segmentEnd, segmentStart } = getSegmentRange(hex.length, selectionStart, selectionEnd);
  const nextSegment = stepSegment(hex.slice(segmentStart, segmentEnd), delta);

  return { hex: hex.slice(0, segmentStart) + nextSegment + hex.slice(segmentEnd), selectionEnd: segmentEnd, selectionStart: segmentStart };
};
