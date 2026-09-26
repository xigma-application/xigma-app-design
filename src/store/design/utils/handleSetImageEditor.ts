// types
import { TDesignState, TImageEditorState } from '../types';

// utils
import { getActivePage } from './getActivePage';
import { isImageFrameNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/utils/isImageFrameNode';

export const handleSetImageEditor = (state: TDesignState, payload: TImageEditorState | null): void => {
  if (!payload) {
    state.imageEditor = null;
  } else {
    const previous = state.imageEditor;
    const isSameCropTarget =
      previous?.mode === 'crop' &&
      previous.nodeId === payload.nodeId &&
      previous.paintIndex === payload.paintIndex &&
      (previous.property ?? 'fills') === (payload.property ?? 'fills');

    switch (true) {
      case payload.mode !== 'crop':
        state.imageEditor = payload;
        break;
      case isSameCropTarget:
        state.imageEditor = { ...payload, cropCancelSnapshot: previous?.cropCancelSnapshot };
        break;
      default: {
        const node = getActivePage(state).nodes[payload.nodeId];

        state.imageEditor = {
          ...payload,
          cropCancelSnapshot: isImageFrameNode(node)
            ? {
                cornerRadius: node.cornerRadius,
                fills: node.fills,
                height: node.height,
                rotation: node.rotation,
                strokes: node.strokes,
                width: node.width,
                x: node.x,
                y: node.y,
              }
            : undefined,
        };
        break;
      }
    }
  }
};
