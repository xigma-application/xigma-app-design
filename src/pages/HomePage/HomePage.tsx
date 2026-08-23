import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// hooks
import { useTheme } from 'hooks';

// others
import { APP_NAME } from 'constant/appName';
import { colors } from 'constant/colors';

// styles
import styles from './home-page.module.scss';

const HomePage: FC = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  return (
    <main className={styles.HomePage}>
      <h1>{APP_NAME}</h1>
      <p style={{ color: colors.neutral2 }}>{t('home.subtitle')}</p>
      <p style={{ color: colors.neutral2 }}>{t('home.description')}</p>
      <button className={styles['HomePage__theme-toggle']} onClick={toggleTheme} type="button">
        {t(theme === 'dark' ? 'app.themeToggle.switchToLight' : 'app.themeToggle.switchToDark')}
      </button>
    </main>
  );
};

export default HomePage;
