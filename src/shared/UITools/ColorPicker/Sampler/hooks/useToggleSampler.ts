export const useToggleSampler =
  (onOpen?: TFunc, onClose?: TFunc): TFunc<[boolean]> =>
  (open) => {
    if (open) {
      onOpen?.();
    } else {
      onClose?.();
    }
  };
