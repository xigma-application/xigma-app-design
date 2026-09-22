import { PDFContext, PDFRef } from 'pdf-lib';

// types
import { TGradientStop } from 'types/design/paint/types';

type TSegment = { c0: number[]; c1: number[] };

const getSegments = (stops: TGradientStop[], getValues: (stop: TGradientStop) => number[]): TSegment[] => {
  const first = stops[0];
  const last = stops[stops.length - 1];
  const segments: TSegment[] = [];

  if (first.position > 0) {
    segments.push({ c0: getValues(first), c1: getValues(first) });
  }

  for (let index = 0; index < stops.length - 1; index += 1) {
    segments.push({ c0: getValues(stops[index]), c1: getValues(stops[index + 1]) });
  }

  if (last.position < 1) {
    segments.push({ c0: getValues(last), c1: getValues(last) });
  }

  return segments;
};

const getBounds = (stops: TGradientStop[]): number[] => {
  const first = stops[0];
  const last = stops[stops.length - 1];
  const bounds: number[] = [];

  if (first.position > 0) {
    bounds.push(first.position);
  }

  for (let index = 1; index < stops.length - 1; index += 1) {
    bounds.push(stops[index].position);
  }

  if (last.position < 1) {
    bounds.push(last.position);
  }

  return bounds;
};

export const getPdfGradientStitchingFunction = (
  context: PDFContext,
  stops: TGradientStop[],
  getValues: (stop: TGradientStop) => number[],
): PDFRef => {
  const sortedStops = [...stops].sort((a, b) => a.position - b.position);
  const segments = getSegments(sortedStops, getValues);
  const functionRefs = segments.map((segment) =>
    context.register(context.obj({ C0: segment.c0, C1: segment.c1, Domain: [0, 1], FunctionType: 2, N: 1 })),
  );

  if (functionRefs.length === 1) {
    return functionRefs[0];
  }

  return context.register(
    context.obj({
      Bounds: getBounds(sortedStops),
      Domain: [0, 1],
      Encode: functionRefs.flatMap(() => [0, 1]),
      FunctionType: 3,
      Functions: functionRefs,
    }),
  );
};
