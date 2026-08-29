export const usePreventMenuRefocus =
  (): TFunc<[Event]> =>
  (event: Event): void => {
    event.preventDefault();
  };
