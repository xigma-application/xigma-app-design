// while the color sampler is active, document.body gets pointer-events:none (only its own
// mask keeps pointer-events:all) — so almost every "outside" interaction during sampling is
// just that trick's fallout (a click that missed the mask falls all the way through to e.g.
// <html>), not a real attempt to dismiss the picker. Treat all of them as still part of the
// sampling gesture; only the mask's own onClick (pick) or Escape should end it.
export const useIgnoreSamplerInteractOutside = (isSamplerActive: boolean): TFunc<[Event]> => {
  return (event: Event): void => {
    if (isSamplerActive) {
      event.preventDefault();
    }
  };
};
