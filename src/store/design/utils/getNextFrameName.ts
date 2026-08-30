// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

const FRAME_NAME_PATTERN = /^Frame (\d+)$/;

export const getNextFrameName = (nodes: Record<string, TSceneNode>): string => {
  const numbers = Object.values(nodes)
    .filter((node) => node.type === NodeType.frame)
    .map((node) => FRAME_NAME_PATTERN.exec(node.name))
    .filter((match): match is RegExpExecArray => match !== null)
    .map((match) => Number(match[1]));

  if (numbers.length === 0) {
    return 'Frame 1';
  }

  return `Frame ${Math.max(...numbers) + 1}`;
};
