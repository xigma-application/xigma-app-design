import { current, isDraft } from '@reduxjs/toolkit';

// types
import { TDesignPage, TDesignState } from '../types';
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getDuplicatePageName } from './getDuplicatePageName';

export type TDuplicatePagePayload = {
  nodeIdMap: Record<string, string>;
  newPageId: string;
  sourceId: string;
};

const remapNodeId = (id: string, nodeIdMap: Record<string, string>): string => nodeIdMap[id] ?? id;

const cloneNodeWithRemappedIds = (node: TSceneNode, nodeIdMap: Record<string, string>): TSceneNode => {
  const clone = structuredClone(node);

  clone.id = remapNodeId(node.id, nodeIdMap);

  if (clone.parentId) {
    clone.parentId = remapNodeId(clone.parentId, nodeIdMap);
  }

  if (clone.type === NodeType.text && clone.pathId) {
    clone.pathId = remapNodeId(clone.pathId, nodeIdMap);
  }

  return clone;
};

export const handleDuplicatePage = (state: TDesignState, payload: TDuplicatePagePayload): void => {
  const { nodeIdMap, newPageId, sourceId } = payload;
  const draftSource = state.pages[sourceId];

  if (draftSource) {
    const source = isDraft(draftSource) ? current(draftSource) : draftSource;
    const nodes = Object.values(source.nodes).reduce<Record<string, TSceneNode>>((accumulator, node) => {
      const clone = cloneNodeWithRemappedIds(node, nodeIdMap);
      accumulator[clone.id] = clone;

      return accumulator;
    }, {});

    const duplicatedPage: TDesignPage = {
      backgroundPaint: source.backgroundPaint,
      comments: structuredClone(source.comments),
      guides: structuredClone(source.guides),
      id: newPageId,
      name: getDuplicatePageName(state.pages, source.name),
      nodes,
      paint: source.paint,
      rootOrder: source.rootOrder.map((id) => remapNodeId(id, nodeIdMap)),
      selectedIds: [],
      viewport: { ...source.viewport },
    };

    const orderedIds = Object.keys(state.pages);
    const insertAfter = orderedIds.indexOf(sourceId) + 1;
    const nextIds = [...orderedIds.slice(0, insertAfter), newPageId, ...orderedIds.slice(insertAfter)];

    state.pages = nextIds.reduce<Record<string, TDesignPage>>((pages, pageId) => {
      pages[pageId] = pageId === newPageId ? duplicatedPage : state.pages[pageId];

      return pages;
    }, {});
    state.activePageId = newPageId;
  }
};
