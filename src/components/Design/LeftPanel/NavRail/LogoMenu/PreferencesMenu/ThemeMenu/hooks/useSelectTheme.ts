// hooks
import { useTheme } from 'hooks';

// types
import { Theme } from 'types/theme';

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
