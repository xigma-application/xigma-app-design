// utils
import { clamp } from 'utils/math/clamp';
import { TCssChannel, TCssToken, tokenizeCssColor } from './tokenizeCssColor';

export type TStepCssValueResult = { selectionEnd: number; selectionStart: number; value: string };

const RGB_MAX_VALUE = 255;
const ALPHA_UNIT_MAX = 100;

const stepChannelText = (channel: TCssChannel, text: string, delta: number): string => {
  if (channel === 'a') {
    const currentUnits = clamp(Math.round(parseFloat(text) * ALPHA_UNIT_MAX), 0, ALPHA_UNIT_MAX);
    const nextUnits = clamp(currentUnits + delta, 0, ALPHA_UNIT_MAX);

    return String(nextUnits / ALPHA_UNIT_MAX);
  }

  const nextValue = clamp(Math.round(parseFloat(text)) + delta, 0, RGB_MAX_VALUE);

  return String(nextValue);
};

const findOverlappingTokens = (tokens: TCssToken[], selectionStart: number, selectionEnd: number): TCssToken[] => {
  const overlapping = tokens.filter((token) => token.start < selectionEnd && token.end > selectionStart);

  if (overlapping.length > 0) {
    return overlapping;
  }

  const nextToken = tokens.find((token) => token.start >= selectionStart);

  return [nextToken ?? tokens[tokens.length - 1]];
};

const findAffectedTokens = (tokens: TCssToken[], selectionStart: number, selectionEnd: number): TCssToken[] => {
  const overlappingTokens = findOverlappingTokens(tokens, selectionStart, selectionEnd);

  if (overlappingTokens.length === tokens.length) {
    return overlappingTokens.filter((token) => token.channel !== 'a');
  }

  return overlappingTokens;
};

const applyStepToTokens = (value: string, affectedTokens: TCssToken[], delta: number): TStepCssValueResult => {
  let nextValue = '';
  let lastIndex = 0;
  let selectionStart = 0;
  let selectionEnd = 0;

  affectedTokens.forEach((token, index) => {
    nextValue += value.slice(lastIndex, token.start);

    if (index === 0) {
      selectionStart = nextValue.length;
    }

    nextValue += stepChannelText(token.channel, value.slice(token.start, token.end), delta);

    if (index === affectedTokens.length - 1) {
      selectionEnd = nextValue.length;
    }

    lastIndex = token.end;
  });

  nextValue += value.slice(lastIndex);

  return { selectionEnd, selectionStart, value: nextValue };
};

export const stepCssValue = (value: string, selectionStart: number, selectionEnd: number, delta: number): TStepCssValueResult | null => {
  const tokens = tokenizeCssColor(value);

  if (tokens) {
    const affectedTokens = findAffectedTokens(tokens, selectionStart, selectionEnd);

    return applyStepToTokens(value, affectedTokens, delta);
  }

  return null;
};
