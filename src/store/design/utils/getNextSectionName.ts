// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

const SECTION_NAME_PATTERN = /^Section (\d+)$/;

export const getNextSectionName = (nodes: Record<string, TSceneNode>): string => {
  const numbers = Object.values(nodes)
    .filter((node) => node.type === NodeType.section)
    .map((node) => SECTION_NAME_PATTERN.exec(node.name))
    .filter((match): match is RegExpExecArray => match !== null)
    .map((match) => Number(match[1]));

  if (numbers.length === 0) {
    return 'Section 1';
  }

  return `Section ${Math.max(...numbers) + 1}`;
};
