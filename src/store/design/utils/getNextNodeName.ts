// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

export const getNextNodeName = (nodes: Record<string, TSceneNode>, nodeType: NodeType, baseName: string): string => {
  const pattern = new RegExp(`^${baseName} \\((\\d+)\\)$`);
  const numbers = Object.values(nodes)
    .filter((node) => node.type === nodeType)
    .map((node) => pattern.exec(node.name))
    .filter((match): match is RegExpExecArray => match !== null)
    .map((match) => Number(match[1]));

  if (numbers.length === 0) {
    return `${baseName} (1)`;
  }

  return `${baseName} (${Math.max(...numbers) + 1})`;
};
