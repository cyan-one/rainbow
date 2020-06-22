import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { View } from 'react-native';
import { useIsEmulator } from 'react-native-device-info';
import Animated, { useCode } from 'react-native-reanimated';
import { useSafeArea } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { BubbleSheet } from '../components/bubble-sheet';
import { Button } from '../components/buttons';
import { DiscoverSheet } from '../components/discover-sheet';
import { BackButton, Header, HeaderHeight } from '../components/header';
import { Centered } from '../components/layout';
import { QRCodeScanner } from '../components/qrcode-scanner';
import {
  WalletConnectExplainer,
  WalletConnectList,
} from '../components/walletconnect-list';
import { discoverSheetAvailable } from '../config/experimental';
import { scrollPosition } from '../navigation/helpers';
import { colors, position } from '../styles';
import { isNewValueForObjectPaths } from '../utils';

const DimmedView = styled(Animated.View)`
  flex: 1;
  width: 100%;
`;

const Background = styled.View`
  position: absolute;
  background-color: black;
  width: 100%;
  height: 100%;
`;

const { greaterThan, onChange, call } = Animated;

const Dim = ({ children }) => (
  <DimmedView
    style={{ opacity: Animated.min(Animated.sub(scrollPosition, 1), 0.9) }}
  >
    {children}
  </DimmedView>
);

const ENABLING_CAMERA_OFFSET = 1.01;

const QRScannerScreen = ({
  enableScanning,
  isCameraAuthorized,
  onPressBackButton,
  onPressPasteSessionUri,
  onScanSuccess,
  onSheetLayout,
  sheetHeight,
  walletConnectorsByDappName,
  walletConnectorsCount,
  ...props
}) => {
  const { result: isEmulator } = useIsEmulator();
  const insets = useSafeArea();
  const [isFocused, setIsFocused] = useState(false);
  useCode(
    () =>
      onChange(
        greaterThan(scrollPosition, ENABLING_CAMERA_OFFSET),
        call([scrollPosition], ([pos]) =>
          setIsFocused(pos > ENABLING_CAMERA_OFFSET)
        )
      ),
    []
  );

  return (
    <View>
      {discoverSheetAvailable ? <DiscoverSheet /> : null}
      <Centered
        {...position.sizeAsObject('100%')}
        backgroundColor={colors.appleBlue}
        direction="column"
        overflow="hidden"
      >
        <Background />
        <Dim>
          <QRCodeScanner
            {...props}
            contentPositionBottom={sheetHeight}
            contentPositionTop={HeaderHeight}
            enableCamera={isFocused}
            enableScanning={enableScanning}
            isCameraAuthorized={isCameraAuthorized}
            isEmulator={isEmulator}
            onSuccess={onScanSuccess}
            showCrosshairText={!!walletConnectorsCount}
          />
        </Dim>
        {discoverSheetAvailable ? null : (
          <BubbleSheet bottom={insets.bottom ? 21 : 0} onLayout={onSheetLayout}>
            {walletConnectorsCount ? (
              <WalletConnectList items={walletConnectorsByDappName} />
            ) : (
              <WalletConnectExplainer />
            )}
          </BubbleSheet>
        )}
        <Header justify="space-between" position="absolute" top={0}>
          <BackButton
            testID="goToBalancesFromScanner"
            color={colors.white}
            direction="left"
            onPress={onPressBackButton}
          />
          {isEmulator && (
            <Button
              backgroundColor={colors.white}
              color={colors.sendScreen.brightBlue}
              onPress={onPressPasteSessionUri}
              size="small"
              type="pill"
            >
              Paste session URI
            </Button>
          )}
        </Header>
      </Centered>
    </View>
  );
};

QRScannerScreen.propTypes = {
  enableScanning: PropTypes.bool,
  isCameraAuthorized: PropTypes.bool,
  isFocused: PropTypes.bool.isRequired,
  modalVisible: PropTypes.bool.isRequired,
  onPressBackButton: PropTypes.func,
  onPressPasteSessionUri: PropTypes.func,
  onScanSuccess: PropTypes.func,
  onSheetLayout: PropTypes.func,
  sheetHeight: PropTypes.number,
  walletConnectorsByDappName: PropTypes.arrayOf(PropTypes.object),
  walletConnectorsCount: PropTypes.number,
};

const arePropsEqual = (prev, next) =>
  !isNewValueForObjectPaths(prev, next, [
    'enableScanning',
    'isCameraAuthorized',
    'sheetHeight',
    'walletConnectorsCount',
    'modalVisible',
  ]);

export default React.memo(QRScannerScreen, arePropsEqual);
