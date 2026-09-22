// types
import { TGradientStop } from 'types/design/paint/types';

// utils
import { formatPostScriptNumber } from './formatPostScriptNumber';
import { hexToRgbFloat } from 'utils/canvas/hexToRgbFloat';

type TColorSegment = { c0: [number, number, number]; c1: [number, number, number]; lower: number; upper: number };

const getColorSegments = (stops: TGradientStop[]): TColorSegment[] => {
  const sorted = [...stops].sort((a, b) => a.position - b.position);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const segments: TColorSegment[] = [];

  if (first.position > 0) {
    segments.push({ c0: hexToRgbFloat(first.color), c1: hexToRgbFloat(first.color), lower: 0, upper: first.position });
  }

  for (let index = 0; index < sorted.length - 1; index += 1) {
    segments.push({
      c0: hexToRgbFloat(sorted[index].color),
      c1: hexToRgbFloat(sorted[index + 1].color),
      lower: sorted[index].position,
      upper: sorted[index + 1].position,
    });
  }

  if (last.position < 1) {
    segments.push({ c0: hexToRgbFloat(last.color), c1: hexToRgbFloat(last.color), lower: last.position, upper: 1 });
  }

  return segments;
};

const getChannelSlopeIntercept = (c0: number, c1: number, lower: number, span: number): string => {
  const slope = (c1 - c0) / span;
  const intercept = c0 - slope * lower;

  return `${formatPostScriptNumber(slope)} mul ${formatPostScriptNumber(intercept)} add`;
};

const getSegmentColorProgram = (segment: TColorSegment): string => {
  const span = segment.upper - segment.lower || 1;
  const r = getChannelSlopeIntercept(segment.c0[0], segment.c1[0], segment.lower, span);
  const g = getChannelSlopeIntercept(segment.c0[1], segment.c1[1], segment.lower, span);
  const b = getChannelSlopeIntercept(segment.c0[2], segment.c1[2], segment.lower, span);

  return `dup ${r} exch dup ${g} exch ${b}`;
};

const getColorLookupBranches = (segments: TColorSegment[], index: number): string => {
  if (index === segments.length - 1) {
    return getSegmentColorProgram(segments[index]);
  }

  return `dup ${formatPostScriptNumber(segments[index].upper)} le { ${getSegmentColorProgram(segments[index])} } { ${getColorLookupBranches(segments, index + 1)} } ifelse`;
};

export const getPdfGradientColorLookupProgram = (stops: TGradientStop[]): string => getColorLookupBranches(getColorSegments(stops), 0);
