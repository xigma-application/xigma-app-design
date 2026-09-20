// types
import { EffectType, NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TMaskRenderer, TScissorRect } from './types';
import { TSceneNode } from 'types/design/types';

// utils
import { getDropShadowMargin } from '../drawBoxLeafNode/getDropShadowMargin';
import { getEffectTexture } from 'utils/design/effects/getEffectTexture';
import { getDeviceScissorRect } from './getDeviceScissorRect';
import { getIsolatedSubtree } from './getIsolatedSubtree';
import { getNodeBlurParams } from './getNodeBlurParams';
import { getNodeTexture } from './getNodeTexture';
import { getNodeBounds } from 'components/Design/Canvas/utils/getNodeBounds';
import { getRotatedCorners } from './getRotatedCorners';

const SCISSOR_PADDING_PX = 4;

const getShadowMargin = (node: TSceneNode): number =>
  'effects' in node
    ? (node.effects ?? []).reduce(
        (margin, effect) => (effect.type === EffectType.dropShadow ? Math.max(margin, getDropShadowMargin(effect)) : margin),
        0,
      )
    : 0;

const getMembersCorners = (node: TSceneNode, members: TSceneNode[]): TPoint[] =>
  [node, ...members].flatMap((member) => getRotatedCorners(getNodeBounds(member), 'rotation' in member ? member.rotation : 0));

const getNodeMargin = (renderer: TMaskRenderer, node: TSceneNode, scale: number): number => {
  const strokeWidth = 'strokeWidth' in node ? (node.strokeWidth ?? 0) : 0;
  const texture = getNodeTexture(node);
  const blur = getNodeBlurParams(renderer, node, EffectType.layerBlur);

  return (
    (blur?.radius ?? 0) * 2 +
    (texture ? getEffectTexture(texture).radius * scale : 0) +
    (getShadowMargin(node) + strokeWidth) * Math.max(1, scale)
  );
};

const getScissorMargin = (renderer: TMaskRenderer, node: TSceneNode, members: TSceneNode[], blurRadius: number, scale: number): number => {
  const ownMargin = getNodeMargin(renderer, node, scale) - blurRadius * 2;
  const memberMargin = members.reduce((margin, member) => Math.max(margin, getNodeMargin(renderer, member, scale)), 0);

  return blurRadius * 2 + Math.max(ownMargin, memberMargin) + SCISSOR_PADDING_PX;
};

const getVisibleMembers = (node: TSceneNode, subtree: TSceneNode[]): TSceneNode[] =>
  node.type === NodeType.frame && node.clipContent ? [] : subtree;

export const getIsolatedScissorRect = (renderer: TMaskRenderer, node: TSceneNode): TScissorRect | null => {
  const isBox = node.type === NodeType.rectangle || node.type === NodeType.frame;
  const subtree = isBox ? getIsolatedSubtree(renderer, node) : null;
  const blur = subtree ? getNodeBlurParams(renderer, node, EffectType.layerBlur) : null;
  const texture = subtree ? getNodeTexture(node) : undefined;

  if (subtree && (blur || texture)) {
    const { context, gl } = renderer;
    const members = getVisibleMembers(node, subtree);
    const pixelRatio = context.canvasWidth > 0 ? gl.drawingBufferWidth / context.canvasWidth : 1;
    const margin = getScissorMargin(renderer, node, members, blur?.radius ?? 0, context.viewport.zoom * pixelRatio);

    return getDeviceScissorRect(renderer, getMembersCorners(node, members), margin);
  }

  return null;
};
