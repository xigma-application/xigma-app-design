export const getAxisHalfExtent = (along: number, across: number, halfAlong: number, halfAcross: number): number => {
  const limitAlong = along === 0 ? Infinity : halfAlong / along;
  const limitAcross = across === 0 ? Infinity : halfAcross / across;

  return Math.min(limitAlong, limitAcross);
};
