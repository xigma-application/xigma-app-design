// types
import { TGradientStop } from 'types/design/paint/types';

// utils
import { formatPostScriptNumber } from './formatPostScriptNumber';

type TAlphaSegment = { c0: number; c1: number; lower: number; upper: number };

const getAlphaSegments = (stops: TGradientStop[]): TAlphaSegment[] => {
  const sorted = [...stops].sort((a, b) => a.position - b.position);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const segments: TAlphaSegment[] = [];

  if (first.position > 0) {
    segments.push({ c0: first.opacity / 100, c1: first.opacity / 100, lower: 0, upper: first.position });
  }

  for (let index = 0; index < sorted.length - 1; index += 1) {
    segments.push({
      c0: sorted[index].opacity / 100,
      c1: sorted[index + 1].opacity / 100,
      lower: sorted[index].position,
      upper: sorted[index + 1].position,
    });
  }

  if (last.position < 1) {
    segments.push({ c0: last.opacity / 100, c1: last.opacity / 100, lower: last.position, upper: 1 });
  }

  return segments;
};

const getSegmentAlphaProgram = (segment: TAlphaSegment): string => {
  const span = segment.upper - segment.lower || 1;
  const slope = (segment.c1 - segment.c0) / span;
  const intercept = segment.c0 - slope * segment.lower;

  return `${formatPostScriptNumber(slope)} mul ${formatPostScriptNumber(intercept)} add`;
};

const getAlphaLookupBranches = (segments: TAlphaSegment[], index: number): string => {
  if (index === segments.length - 1) {
    return getSegmentAlphaProgram(segments[index]);
  }

  return `dup ${formatPostScriptNumber(segments[index].upper)} le { ${getSegmentAlphaProgram(segments[index])} } { ${getAlphaLookupBranches(segments, index + 1)} } ifelse`;
};

export const getPdfGradientAlphaLookupProgram = (stops: TGradientStop[]): string => getAlphaLookupBranches(getAlphaSegments(stops), 0);
