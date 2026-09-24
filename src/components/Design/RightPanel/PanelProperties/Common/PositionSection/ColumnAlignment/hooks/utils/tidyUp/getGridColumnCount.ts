export const getGridColumnCount = (rowLengths: number[]): number => {
  const [firstLength] = rowLengths;
  const isRegular = rowLengths.slice(0, -1).every((length) => length === firstLength) && rowLengths[rowLengths.length - 1] <= firstLength;
  const itemCount = rowLengths.reduce((sum, length) => sum + length, 0);

  return isRegular ? firstLength : Math.ceil(Math.sqrt(itemCount));
};
