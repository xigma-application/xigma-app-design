// hooks
import { Theme, useTheme } from 'hooks';

export type TUseSelectTheme = {
  selectTheme: (theme: Theme) => () => void;
  selectedTheme: Theme;
};

export const useSelectTheme = (): TUseSelectTheme => {
  const { setTheme, theme } = useTheme();

  return {
    selectTheme: (nextTheme: Theme) => (): void => {
      setTheme(nextTheme);
    },
    selectedTheme: theme,
  };
};
