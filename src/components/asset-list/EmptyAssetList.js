import { times } from 'lodash';
import React, { useMemo } from 'react';
import { useSafeArea } from 'react-native-safe-area-context';
import styled from 'styled-components/primitives';
import { position } from '../../styles';
import AddFundsInterstitial from '../AddFundsInterstitial';
import { FabWrapperBottomPosition } from '../fab';
import { Centered, Column } from '../layout';
import AssetListHeader, { AssetListHeaderHeight } from './AssetListHeader';
import AssetListItemSkeleton from './AssetListItemSkeleton';

const Container = styled(Column)`
  ${position.size('100%')};
`;

const EmptyAssetList = ({
  descendingOpacity,
  isWalletEthZero,
  network,
  skeletonCount = 5,
  title,
  ...props
}) => {
  const { bottom: bottomInset } = useSafeArea();

  const interstitialOffset = useMemo(() => {
    let offset = bottomInset + FabWrapperBottomPosition;
    if (title) {
      offset += AssetListHeaderHeight;
    }
    return offset * -1;
  }, [bottomInset, title]);

  return (
    <Container {...props}>
      {title && <AssetListHeader title={title} />}
      <Centered flex={1}>
        <Column cover>
          {times(skeletonCount, index => (
            <AssetListItemSkeleton
              animated={!isWalletEthZero}
              descendingOpacity={descendingOpacity || isWalletEthZero}
              index={index}
              key={`skeleton${index}`}
            />
          ))}
        </Column>
        {isWalletEthZero && (
          <AddFundsInterstitial
            network={network}
            offsetY={interstitialOffset}
          />
        )}
      </Centered>
    </Container>
  );
};

export default React.memo(EmptyAssetList);
