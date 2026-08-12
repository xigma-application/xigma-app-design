import { FC, useEffect } from 'react';
import { matchPath, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';

// others
import { APP_NAME } from 'constant/appName';
import { APP_ROUTES_DATA } from '../../constants/appRoutesData';
import { ROUTES } from '../../constants/routes';

export const Title: FC = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    const route = APP_ROUTES_DATA.find(({ name }) => matchPath(ROUTES[name], pathname));
    const title = t(route ? route.titleKey : 'routing.title.notFound');

    document.title = `${title} - ${APP_NAME}`;
  }, [pathname, t]);

  return null;
};

export default Title;
