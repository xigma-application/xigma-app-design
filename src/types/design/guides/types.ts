export type TGuideAxis = 'x' | 'y';

export type TGuide = {
  axis: TGuideAxis;
  id: string;
  position: number;
};

export type TGuideLine = {
  axis: TGuideAxis;
  frameId: string | null;
  id: string;
  span: { from: number; to: number } | null;
  worldPosition: number;
};
