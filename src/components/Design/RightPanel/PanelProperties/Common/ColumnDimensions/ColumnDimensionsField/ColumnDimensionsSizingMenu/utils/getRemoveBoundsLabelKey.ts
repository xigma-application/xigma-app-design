export const getRemoveBoundsLabelKey = (isWidth: boolean, minShown: boolean, maxShown: boolean): string => {
  const boundsShown = minShown && maxShown ? 'minMax' : maxShown ? 'max' : 'min';

  switch (boundsShown) {
    case 'minMax':
      return isWidth ? 'removeMinMaxWidth' : 'removeMinMaxHeight';
    case 'max':
      return isWidth ? 'removeMaxWidth' : 'removeMaxHeight';
    default:
      return isWidth ? 'removeMinWidth' : 'removeMinHeight';
  }
};
