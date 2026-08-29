import { generatePath, useParams } from 'react-router';

// others
import { RouteName, ROUTES } from 'core/Routing/constants/routes';

export const useCopyPageLink = (id: string): TFunc => {
  const { id: fileId = '' } = useParams();

  return (): void => {
    const path = generatePath(ROUTES[RouteName.design], { id: fileId });

    navigator.clipboard.writeText(`${window.location.origin}${path}?page=${id}`);
  };
};
