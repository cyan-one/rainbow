import React from 'react';
import styled from 'styled-components/primitives';
import { colors } from '../../styles';
import { magicMemo } from '../../utils';
import { OpacityToggler } from '../animations';
import { Text } from '../text';

const LabelText = styled(Text).attrs({
  color: colors.alpha(colors.blueGreyDark, 0.6),
  letterSpacing: 'roundedTight',
  size: 'lmedium',
  weight: 'semibold',
})`
  position: absolute;
  top: -10.25;
`;

const CoinDividerButtonLabel = ({
  endingOpacity,
  isVisible,
  label,
  startingOpacity,
}) => (
  <OpacityToggler
    endingOpacity={endingOpacity}
    isVisible={isVisible}
    startingOpacity={startingOpacity}
  >
    <LabelText>{label}</LabelText>
  </OpacityToggler>
);

export default magicMemo(CoinDividerButtonLabel, 'isVisible');
