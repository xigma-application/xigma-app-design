export const useIgnoreSamplerInteractOutside = (isSamplerActive: boolean): TFunc<[Event]> => {
  return (event: Event): void => {
    if (isSamplerActive) {
      event.preventDefault();
    }
  };
};
