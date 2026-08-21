// utils
import { getEditableLines } from './getEditableLines';

export const getEditableTextContent = (element: HTMLElement): string =>
  getEditableLines(element)
    .map((line) => line.nodes.map((textNode) => textNode.data).join(''))
    .join('\n');
