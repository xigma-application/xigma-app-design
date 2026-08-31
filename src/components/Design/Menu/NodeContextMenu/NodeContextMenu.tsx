import { FC, RefObject } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Menu, MenuCompound, TVirtualAnchor } from 'shared';

// hooks
import { usePreventMenuRefocus, useStopClickPropagation } from 'hooks';

// others
import { KEYBOARD_SHORTCUTS } from 'components/Design/keys';
import {
  NODE_MENU_ADD_AUTO_LAYOUT_KEY,
  NODE_MENU_ADD_MOTION_KEY,
  NODE_MENU_BRING_TO_FRONT_KEY,
  NODE_MENU_CONVERT_TO_FRAME_KEY,
  NODE_MENU_CONVERT_TO_SECTION_KEY,
  NODE_MENU_COPY_KEY,
  NODE_MENU_COPY_PASTE_AS_KEY,
  NODE_MENU_CREATE_COMPONENT_KEY,
  NODE_MENU_CREATE_SEPARATE_LAYERS_KEY,
  NODE_MENU_FLATTEN_KEY,
  NODE_MENU_FLIP_HORIZONTAL_KEY,
  NODE_MENU_FLIP_VERTICAL_KEY,
  NODE_MENU_FRAME_SELECTION_KEY,
  NODE_MENU_GROUP_SELECTION_KEY,
  NODE_MENU_LOCK_UNLOCK_KEY,
  NODE_MENU_MORE_LAYOUT_OPTIONS_KEY,
  NODE_MENU_MOVE_TO_PAGE_KEY,
  NODE_MENU_OUTLINE_STROKE_KEY,
  NODE_MENU_PASTE_TO_REPLACE_KEY,
  NODE_MENU_PLUGINS_KEY,
  NODE_MENU_RENAME_KEY,
  NODE_MENU_SEND_TO_BACK_KEY,
  NODE_MENU_SEND_TO_MAKE_KEY,
  NODE_MENU_SET_AS_THUMBNAIL_KEY,
  NODE_MENU_SHOW_HIDE_KEY,
  NODE_MENU_UNGROUP_KEY,
  NODE_MENU_USE_AS_MASK_KEY,
  NODE_MENU_WIDGETS_KEY,
} from '../constants';

// store
import { TDesignPage } from 'store/design/types';

// styles
import styles from './node-context-menu.module.scss';

// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { isConvertibleToVectorNode } from 'utils/canvas/vectorNetwork/convertShapeToVector/convertNodeToVector';

const { MenuItem, MenuSeparator, MenuSub } = MenuCompound;

export type TNodeContextMenuProps = {
  anchorRef: RefObject<TVirtualAnchor>;
  isOpen: boolean;
  node: TSceneNode;
  onBringToFront: TFunc;
  onCopy: TFunc;
  onFlatten: TFunc;
  onGroupSelection: TFunc;
  onMoveToPage: TFunc<[string]>;
  onOpenChange: TFunc<[boolean]>;
  onOutlineStroke: TFunc;
  onPasteToReplace: TFunc;
  onRename: TFunc;
  onSendToBack: TFunc;
  onToggleHidden: TFunc;
  onToggleLocked: TFunc;
  otherPages: TDesignPage[];
};

const NodeContextMenu: FC<TNodeContextMenuProps> = ({
  anchorRef,
  isOpen,
  node,
  onBringToFront,
  onCopy,
  onFlatten,
  onGroupSelection,
  onMoveToPage,
  onOpenChange,
  onOutlineStroke,
  onPasteToReplace,
  onRename,
  onSendToBack,
  onToggleHidden,
  onToggleLocked,
  otherPages,
}) => {
  const { t } = useTranslation();
  const handlePreventRefocus = usePreventMenuRefocus();
  const handleStopPropagation = useStopClickPropagation();
  const isFrame = node.type === NodeType.frame;
  const isSection = node.type === NodeType.section;
  const isTextOnPath = node.type === NodeType.text && Boolean(node.pathId);
  const canFlatten = isConvertibleToVectorNode(node) || (node.type === NodeType.text && !isTextOnPath);
  const hasStrokeWidth = 'strokeWidth' in node && Boolean(node.strokeWidth);
  const hasStrokeColor = node.type === NodeType.line ? Boolean(node.stroke) : 'strokeColor' in node && Boolean(node.strokeColor);
  const canOutlineStroke = !isTextOnPath && hasStrokeWidth && hasStrokeColor;

  return (
    <Menu
      anchorRef={anchorRef}
      className={styles.NodeContextMenu}
      onClick={handleStopPropagation}
      onCloseAutoFocus={handlePreventRefocus}
      onOpenChange={onOpenChange}
      open={isOpen}
      side="bottom"
      sideOffset={0}
    >
      <MenuItem label={t(NODE_MENU_COPY_KEY)} onClick={onCopy} shortcut={KEYBOARD_SHORTCUTS.copy.join('')} withCheck={false} />
      <MenuItem
        label={t(NODE_MENU_PASTE_TO_REPLACE_KEY)}
        onClick={onPasteToReplace}
        shortcut={KEYBOARD_SHORTCUTS.pasteToReplace.join('')}
        withCheck={false}
      />
      <MenuItem disabled label={t(NODE_MENU_COPY_PASTE_AS_KEY)} withCheck={false} />
      {!isSection && !isTextOnPath && <MenuItem disabled label={t(NODE_MENU_SEND_TO_MAKE_KEY)} withCheck={false} />}
      {!isSection && <MenuItem disabled label={t(NODE_MENU_ADD_MOTION_KEY)} withCheck={false} />}
      <MenuSeparator />
      <MenuSub disabled={otherPages.length === 0} label={t(NODE_MENU_MOVE_TO_PAGE_KEY)} withCheck={false}>
        {otherPages.map((page) => (
          <MenuItem key={page.id} label={page.name} onClick={(): void => onMoveToPage(page.id)} withCheck={false} />
        ))}
      </MenuSub>
      <MenuItem
        label={t(NODE_MENU_BRING_TO_FRONT_KEY)}
        onClick={onBringToFront}
        shortcut={KEYBOARD_SHORTCUTS.bringToFront.join('')}
        withCheck={false}
      />
      <MenuItem
        label={t(NODE_MENU_SEND_TO_BACK_KEY)}
        onClick={onSendToBack}
        shortcut={KEYBOARD_SHORTCUTS.sendToBack.join('')}
        withCheck={false}
      />
      <MenuSeparator />
      {isFrame && <MenuItem disabled label={t(NODE_MENU_CONVERT_TO_SECTION_KEY)} withCheck={false} />}
      {isSection && <MenuItem disabled label={t(NODE_MENU_CONVERT_TO_FRAME_KEY)} withCheck={false} />}
      {!isSection && (
        <MenuItem
          label={t(NODE_MENU_GROUP_SELECTION_KEY)}
          onClick={onGroupSelection}
          shortcut={KEYBOARD_SHORTCUTS.groupSelection.join('')}
          withCheck={false}
        />
      )}
      {!isSection && (
        <MenuItem
          disabled
          label={t(NODE_MENU_FRAME_SELECTION_KEY)}
          shortcut={KEYBOARD_SHORTCUTS.frameSelection.join('')}
          withCheck={false}
        />
      )}
      {(isFrame || isSection) && (
        <MenuItem disabled label={t(NODE_MENU_UNGROUP_KEY)} shortcut={KEYBOARD_SHORTCUTS.ungroupSelection.join('')} withCheck={false} />
      )}
      <MenuItem label={t(NODE_MENU_RENAME_KEY)} onClick={onRename} shortcut={KEYBOARD_SHORTCUTS.renameLayer.join('')} withCheck={false} />
      {!isFrame && !isSection && (
        <MenuItem
          disabled={!canFlatten}
          label={t(NODE_MENU_FLATTEN_KEY)}
          onClick={onFlatten}
          shortcut={KEYBOARD_SHORTCUTS.flatten.join('')}
          withCheck={false}
        />
      )}
      {isTextOnPath && <MenuItem disabled label={t(NODE_MENU_CREATE_SEPARATE_LAYERS_KEY)} withCheck={false} />}
      {!isFrame && !isSection && (
        <MenuItem
          disabled={!canOutlineStroke}
          label={t(NODE_MENU_OUTLINE_STROKE_KEY)}
          onClick={onOutlineStroke}
          shortcut={KEYBOARD_SHORTCUTS.outlineStroke.join('')}
          withCheck={false}
        />
      )}
      {!isSection && (
        <MenuItem disabled label={t(NODE_MENU_USE_AS_MASK_KEY)} shortcut={KEYBOARD_SHORTCUTS.useAsMask.join('')} withCheck={false} />
      )}
      {(isFrame || isSection) && <MenuItem disabled label={t(NODE_MENU_SET_AS_THUMBNAIL_KEY)} withCheck={false} />}
      <MenuSeparator />
      {!isSection && (
        <MenuItem
          disabled
          label={t(NODE_MENU_ADD_AUTO_LAYOUT_KEY)}
          shortcut={KEYBOARD_SHORTCUTS.addAutoLayout.join('')}
          withCheck={false}
        />
      )}
      {(isFrame || isSection) && <MenuSub disabled label={t(NODE_MENU_MORE_LAYOUT_OPTIONS_KEY)} withCheck={false} />}
      {!isSection && (
        <MenuItem
          disabled
          label={t(NODE_MENU_CREATE_COMPONENT_KEY)}
          shortcut={KEYBOARD_SHORTCUTS.createComponent.join('')}
          withCheck={false}
        />
      )}
      <MenuItem disabled label={t(NODE_MENU_PLUGINS_KEY)} withCheck={false} />
      <MenuItem disabled label={t(NODE_MENU_WIDGETS_KEY)} withCheck={false} />
      <MenuSeparator />
      <MenuItem
        label={t(NODE_MENU_SHOW_HIDE_KEY)}
        onClick={onToggleHidden}
        shortcut={KEYBOARD_SHORTCUTS.hideShowLayer.join('')}
        withCheck={false}
      />
      <MenuItem
        label={t(NODE_MENU_LOCK_UNLOCK_KEY)}
        onClick={onToggleLocked}
        shortcut={KEYBOARD_SHORTCUTS.lockUnlockLayer.join('')}
        withCheck={false}
      />
      {!isSection && (
        <>
          <MenuSeparator />
          <MenuItem
            disabled
            label={t(NODE_MENU_FLIP_HORIZONTAL_KEY)}
            shortcut={KEYBOARD_SHORTCUTS.flipHorizontal.join('')}
            withCheck={false}
          />
          <MenuItem disabled label={t(NODE_MENU_FLIP_VERTICAL_KEY)} shortcut={KEYBOARD_SHORTCUTS.flipVertical.join('')} withCheck={false} />
        </>
      )}
    </Menu>
  );
};

export default NodeContextMenu;
