import { get } from 'lodash';
import React, { useCallback, useState } from 'react';
import { InteractionManager } from 'react-native';
import styled, { css } from 'styled-components/primitives';
import { useDimensions } from '../../hooks';
import { padding } from '../../styles';
import { haptics, neverRerender } from '../../utils';
import { ButtonPressAnimation } from '../animations';
import { CoinIconSize } from '../coin-icon';
import { FloatingEmojis } from '../floating-emojis';
import { Centered, ColumnWithMargins } from '../layout';
import BalanceText from './BalanceText';
import BottomRowText from './BottomRowText';
import CoinName from './CoinName';
import CoinRow from './CoinRow';
import CoinRowFavoriteButton from './CoinRowFavoriteButton';

const CoinRowPaddingTop = 11;
const CoinRowPaddingBottom = 11;

const FloatingFavoriteEmojis = styled(FloatingEmojis).attrs({
  centerVertically: true,
  disableHorizontalMovement: true,
  disableVerticalMovement: true,
  distance: 70,
  duration: 400,
  emojis: ['star2'],
  fadeOut: false,
  marginTop: 11,
  range: [0, 0],
  scaleTo: 0,
  size: 32,
  wiggleFactor: 0,
})`
  left: ${({ deviceWidth }) => deviceWidth - 46};
  position: absolute;
  right: 0;
  top: 0;
  z-index: 100;
`;

const BottomRow = ({ showBalance, symbol }) =>
  showBalance ? null : <BottomRowText>{symbol}</BottomRowText>;

const TopRow = ({ name, showBalance }) => (
  <Centered height={showBalance ? CoinIconSize : null}>
    <CoinName>{name}</CoinName>
  </Centered>
);

const ExchangeCoinRow = ({
  item,
  onFavoriteAsset,
  onPress,
  showBalance,
  showFavoriteButton,
  ...props
}) => {
  const { width: deviceWidth } = useDimensions();
  const [localFavorite, setLocalFavorite] = useState(!!item.favorite);

  const handlePress = useCallback(() => onPress(item), [item, onPress]);

  return (
    <ButtonPressAnimation
      {...props}
      height={CoinIconSize + CoinRowPaddingTop + CoinRowPaddingBottom}
      onPress={handlePress}
      scaleTo={0.96}
    >
      <CoinRow
        {...item}
        bottomRowRender={BottomRow}
        containerStyles={css(
          padding(
            CoinRowPaddingTop,
            showFavoriteButton ? 38 : 0,
            CoinRowPaddingBottom,
            15
          )
        )}
        showBalance={showBalance}
        topRowRender={TopRow}
      >
        {showBalance && (
          <ColumnWithMargins align="end" margin={4}>
            <BalanceText>
              {get(item, 'native.balance.display', '–')}
            </BalanceText>
            <BottomRowText>{get(item, 'balance.display', '')}</BottomRowText>
          </ColumnWithMargins>
        )}
        {showFavoriteButton && (
          <FloatingFavoriteEmojis deviceWidth={deviceWidth}>
            {({ onNewEmoji }) => (
              <CoinRowFavoriteButton
                isFavorited={localFavorite}
                onPress={() => {
                  const newLocalFavorite = !localFavorite;
                  if (newLocalFavorite) {
                    haptics.impactMedium();
                    InteractionManager.runAfterInteractions(() => {
                      onNewEmoji();
                    });
                  }
                  setLocalFavorite(newLocalFavorite);
                  onFavoriteAsset(item.address, newLocalFavorite);
                }}
              />
            )}
          </FloatingFavoriteEmojis>
        )}
      </CoinRow>
    </ButtonPressAnimation>
  );
};

export default neverRerender(ExchangeCoinRow);
