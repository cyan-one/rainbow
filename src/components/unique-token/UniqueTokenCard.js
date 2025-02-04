import React, { useCallback } from 'react';
import styled from 'styled-components/primitives';
import { colors, shadow as shadowUtil } from '../../styles';
import { magicMemo } from '../../utils';
import { ButtonPressAnimation } from '../animations';
import { InnerBorder } from '../layout';
import UniqueTokenImage from './UniqueTokenImage';

const UniqueTokenCardBorderRadius = 18;
const UniqueTokenCardShadow = [0, 2, 3, colors.dark, 0.08];

const Container = styled(ButtonPressAnimation)`
  ${({ shadow }) => shadowUtil.build(...shadow)};
`;

const Content = styled.View`
  border-radius: ${UniqueTokenCardBorderRadius};
  height: ${({ height }) => height};
  overflow: hidden;
  width: ${({ width }) => width};
`;

const UniqueTokenCard = ({
  borderEnabled = true,
  disabled,
  enableHapticFeedback = true,
  height,
  item: { background, image_preview_url, ...item },
  onPress,
  resizeMode,
  scaleTo = 0.96,
  shadow = UniqueTokenCardShadow,
  style,
  width,
  ...props
}) => {
  const handlePress = useCallback(() => {
    if (onPress) {
      onPress(item);
    }
  }, [item, onPress]);

  return (
    <Container
      disabled={disabled}
      enableHapticFeedback={enableHapticFeedback}
      onPress={handlePress}
      scaleTo={scaleTo}
      shadow={shadow}
    >
      <Content {...props} height={height} style={style} width={width}>
        <UniqueTokenImage
          backgroundColor={background || colors.lightestGrey}
          imageUrl={image_preview_url}
          item={item}
          resizeMode={resizeMode}
        />
        {borderEnabled && (
          <InnerBorder
            opacity={0.04}
            radius={UniqueTokenCardBorderRadius}
            width={0.5}
          />
        )}
      </Content>
    </Container>
  );
};

export default magicMemo(UniqueTokenCard, [
  'height',
  'item.uniqueId',
  'style',
  'width',
]);
