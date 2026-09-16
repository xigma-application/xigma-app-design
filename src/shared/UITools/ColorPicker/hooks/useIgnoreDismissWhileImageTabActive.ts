export const useIgnoreDismissWhileImageTabActive = (isImageTabActive: boolean): TFunc<[Event]> => {
  return (event: Event): void => {
    if (isImageTabActive) {
      event.preventDefault();
    }
  };
};
