// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

export type TPathOutlineStyle = 'editing' | 'hover' | 'selected';

export const getPathOutlineStyles = (
  nodes: TSceneNode[],
  selectedIds: Set<string>,
  editingNodeId: string | null,
  hoveredNodeId: string | null,
  editingPathId?: string | null,
): Map<string, TPathOutlineStyle> => {
  const styles = new Map<string, TPathOutlineStyle>();

  nodes.forEach((node) => {
    if (node.type === NodeType.text && node.pathId) {
      const isEditing = node.id === editingNodeId;
      const isSelected = selectedIds.has(node.id);
      const isHovered = node.id === hoveredNodeId;
      const style: TPathOutlineStyle | undefined = isEditing ? 'editing' : isHovered ? 'hover' : isSelected ? 'selected' : undefined;

      if (style) {
        styles.set(node.pathId, style);
      }
    }
  });

  if (editingPathId) {
    styles.set(editingPathId, 'editing');
  }

  return styles;
};
