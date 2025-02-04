import React, { useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '../../navigation/Navigation';
import Routes from '../../screens/Routes/routesNames';
import { colors } from '../../styles';
import { magicMemo } from '../../utils';
import { Icon } from '../icons';
import FloatingActionButton from './FloatingActionButton';

const FabShadow = [
  [0, 10, 30, colors.dark, 0.4],
  [0, 5, 15, colors.swapPurple, 0.5],
];

const ExchangeFab = ({ disabled, isReadOnlyWallet, ...props }) => {
  const { navigate } = useNavigation();

  const handlePress = useCallback(() => {
    if (!isReadOnlyWallet) {
      navigate(Routes.EXCHANGE_MODAL);
    } else {
      Alert.alert(`You need to import the wallet in order to do this`);
    }
  }, [navigate, isReadOnlyWallet]);

  return (
    <FloatingActionButton
      {...props}
      backgroundColor={colors.swapPurple}
      disabled={disabled}
      onPress={handlePress}
      shadows={FabShadow}
    >
      <Icon height={21} marginBottom={2} name="swap" width={26} />
    </FloatingActionButton>
  );
};

export default magicMemo(ExchangeFab, ['disabled', 'isReadOnlyWallet']);
