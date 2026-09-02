// types
import { NodeType } from 'types/design/enums';
import { TDeleteAllGuidesPayload, TDesignState } from '../types';

// utils
import { getActivePage } from './getActivePage';

export const handleDeleteAllGuides = (state: TDesignState, payload: TDeleteAllGuidesPayload): void => {
  const page = getActivePage(state);

  page.guides = page.guides.filter((guide) => guide.axis !== payload.axis);

  Object.values(page.nodes).forEach((node) => {
    if (node.type === NodeType.frame && node.guides) {
      node.guides = node.guides.filter((guide) => guide.axis !== payload.axis);
    }
  });
};
