// types
import { TEllipseArcLengthSample, TEllipsePathSample } from 'types/canvas';

// utils
import { getEllipseCircumference } from './getEllipseCircumference';

const findBracketingIndex = (table: TEllipseArcLengthSample[], length: number): number => {
  let low = 0;
  let high = table.length - 1;

  while (low < high) {
    const mid = Math.ceil((low + high) / 2);

    if (table[mid].cumulativeLength <= length) {
      low = mid;
    } else {
      high = mid - 1;
    }
  }

  return low;
};

export const getEllipsePathSample = (
  width: number,
  height: number,
  table: TEllipseArcLengthSample[],
  length: number,
): TEllipsePathSample => {
  const circumference = getEllipseCircumference(table);
  let sample: TEllipsePathSample = { angleDegrees: 0, x: 0, y: 0 };

  if (circumference > 0) {
    const wrappedLength = ((length % circumference) + circumference) % circumference;
    const index = findBracketingIndex(table, wrappedLength);
    const nextIndex = Math.min(index + 1, table.length - 1);
    const segmentLength = table[nextIndex].cumulativeLength - table[index].cumulativeLength;
    const fraction = segmentLength > 0 ? (wrappedLength - table[index].cumulativeLength) / segmentLength : 0;
    const angle = table[index].angle + fraction * (table[nextIndex].angle - table[index].angle);
    const radiusX = width / 2;
    const radiusY = height / 2;

    sample = {
      angleDegrees: (Math.atan2(radiusY * Math.cos(angle), -radiusX * Math.sin(angle)) * 180) / Math.PI,
      x: radiusX * Math.cos(angle),
      y: radiusY * Math.sin(angle),
    };
  }

  return sample;
};
