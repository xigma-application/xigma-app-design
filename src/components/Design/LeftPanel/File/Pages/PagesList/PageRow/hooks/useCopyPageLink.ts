// utils
import { getQueryParam } from 'components/App/utils/getQueryParam';

export const useCopyPageLink = (id: string): TFunc => {
  return (): void => {
    const projectParam = getQueryParam('project');
    const projectQuery = projectParam ? `project=${projectParam}&` : '';

    navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?${projectQuery}page=${id}`);
  };
};
