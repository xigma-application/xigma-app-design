// types
import { TVectorNode } from 'types/design/types';

export type TVectorWidthOffsets = { leftOffset: number; rightOffset: number };

type TVectorWidthBreakpoint = TVectorWidthOffsets & { position: number };

export const getVectorWidthOffsetsAtChainPosition = (node: TVectorNode, position: number): TVectorWidthOffsets => {
  const baseOffset = node.strokeWidth / 2;
  const explicitPoints = Object.values(node.widthProfile?.points ?? {});
  const impliedBreakpoints: TVectorWidthBreakpoint[] = [
    { leftOffset: baseOffset, position: 0, rightOffset: baseOffset },
    { leftOffset: baseOffset, position: 1, rightOffset: baseOffset },
  ];
  const explicitBreakpoints: TVectorWidthBreakpoint[] = explicitPoints.map((point) => ({
    leftOffset: point.leftOffset,
    position: point.position,
    rightOffset: point.rightOffset,
  }));
  const breakpoints = [...impliedBreakpoints, ...explicitBreakpoints].sort((a, b) => a.position - b.position);

  const upperIndex = Math.max(
    breakpoints.findIndex((breakpoint) => breakpoint.position >= position),
    1,
  );
  const upper = breakpoints[upperIndex];
  const lower = breakpoints[upperIndex - 1];
  const span = upper.position - lower.position;
  const ratio = span === 0 ? 0 : (position - lower.position) / span;

  return {
    leftOffset: lower.leftOffset + (upper.leftOffset - lower.leftOffset) * ratio,
    rightOffset: lower.rightOffset + (upper.rightOffset - lower.rightOffset) * ratio,
  };
};
