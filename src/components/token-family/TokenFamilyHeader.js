import React from 'react';
import FastImage from 'react-native-fast-image';
import Animated, { Easing } from 'react-native-reanimated';
import { toRad, useTimingTransition } from 'react-native-redash';
import styled from 'styled-components/primitives';
import CaretImageSource from '../../assets/family-dropdown-arrow.png';
import { colors, padding } from '../../styles';
import { ButtonPressAnimation, interpolate } from '../animations';
import { Row, RowWithMargins } from '../layout';
import { Emoji, Text, TruncatedText } from '../text';
import TokenFamilyHeaderIcon from './TokenFamilyHeaderIcon';

const AnimatedFastImage = Animated.createAnimatedComponent(FastImage);

export const TokenFamilyHeaderAnimationDuration = 200;
export const TokenFamilyHeaderHeight = 50;

const Content = styled(Row).attrs({
  align: 'center',
  justify: 'space-between',
})`
  ${({ isCoinRow }) => padding(0, isCoinRow ? 16 : 19)};
  background-color: ${colors.white};
  height: ${TokenFamilyHeaderHeight};
  width: 100%;
`;

const ChildrenAmountText = styled(Text).attrs({
  align: 'right',
  letterSpacing: 'roundedTight',
  size: 'large',
})`
  margin-bottom: 1;
`;

const RotatingArrowIcon = styled(AnimatedFastImage).attrs({
  resizeMode: FastImage.resizeMode.contain,
  source: CaretImageSource,
})`
  height: 17;
  margin-bottom: 1;
  right: 4;
  width: 9;
`;

const TitleText = styled(TruncatedText).attrs({
  align: 'left',
  letterSpacing: 'roundedMedium',
  lineHeight: 'normal',
  size: 'large',
  weight: 'semibold',
})`
  flex: 1;
  margin-bottom: 1;
  padding-left: ${({ isShowcase }) => (!isShowcase ? 9 : 0)};
  padding-right: 9;
`;

const TokenFamilyHeader = ({
  childrenAmount,
  emoji,
  familyImage,
  isCoinRow,
  isOpen,
  onPress,
  title,
}) => {
  const animation = useTimingTransition(!isOpen, {
    duration: TokenFamilyHeaderAnimationDuration,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  });

  const rotate = toRad(
    interpolate(animation, {
      inputRange: [0, 1],
      outputRange: [90, 0],
    })
  );

  return (
    <ButtonPressAnimation
      key={`${emoji || familyImage || title}_${isOpen}`}
      onPress={onPress}
      scaleTo={1.05}
    >
      <Content isCoinRow={isCoinRow}>
        <RowWithMargins align="center" margin={emoji ? 5 : 9}>
          {emoji ? (
            <Emoji size="lmedium" name={emoji} />
          ) : (
            <TokenFamilyHeaderIcon
              familyImage={familyImage}
              familyName={title}
              isCoinRow={isCoinRow}
            />
          )}
        </RowWithMargins>
        <TitleText isShowcase={title === 'Showcase'}>{title}</TitleText>
        <RowWithMargins align="center" margin={13}>
          <Animated.View style={{ opacity: animation }}>
            <ChildrenAmountText>{childrenAmount}</ChildrenAmountText>
          </Animated.View>
          <RotatingArrowIcon style={{ transform: [{ rotate }] }} />
        </RowWithMargins>
      </Content>
    </ButtonPressAnimation>
  );
};

export default React.memo(TokenFamilyHeader);
