export const getAxisSign = (side: 'max' | 'min' | 'none'): number => {
  switch (side) {
    case 'max':
      return -1;
    case 'min':
      return 1;
    default:
      return 0;
  }
};
