export type TUseEllipseCornerRadiusResult = {
  onCommit: (raw: string) => void;
  onScrub: (next: number) => void;
  value: number;
  valueLabel: number | string;
};
