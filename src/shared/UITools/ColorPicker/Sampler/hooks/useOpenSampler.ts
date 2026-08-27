export const useOpenSampler =
  (onClick?: TFunc): TFunc<[boolean]> =>
  (open) => {
    if (open) {
      onClick?.();
    }
  };
