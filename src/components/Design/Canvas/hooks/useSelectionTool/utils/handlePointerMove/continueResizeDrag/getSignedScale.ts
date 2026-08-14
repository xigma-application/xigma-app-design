export const getSignedScale = (
  newStart: number,
  newSize: number,
  originStart: number,
  originSize: number,
  anchor: number | null,
): number => {
  const originCenter = originStart + originSize / 2;

  switch (true) {
    case anchor === null:
    case originCenter === anchor:
      return 1;
    default: {
      const newCenter = newStart + newSize / 2;
      return (newCenter - anchor!) / (originCenter - anchor!);
    }
  }
};
