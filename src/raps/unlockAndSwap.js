import { concat, reduce } from 'lodash';
import { estimateSwapGasLimit } from '../handlers/uniswap';
import { add } from '../helpers/utilities';
import { rapsAddOrUpdate } from '../redux/raps';
import store from '../redux/store';
import { ethUnits } from '../references';
import { contractUtils } from '../utils';
import { assetNeedsUnlocking } from './actions/unlock';
import { createNewAction, createNewRap, RapActionTypes } from './common';

export const estimateUnlockAndSwap = async ({
  inputAmount,
  inputCurrency,
  tradeDetails,
  useV1,
}) => {
  if (!tradeDetails) return ethUnits.basic_swap;

  const { accountAddress, chainId } = store.getState().settings;
  let gasLimits = [];

  const swapAssetNeedsUnlocking = await assetNeedsUnlocking(
    accountAddress,
    inputAmount,
    inputCurrency,
    inputCurrency.exchangeAddress
  );
  if (swapAssetNeedsUnlocking) {
    const unlockGasLimit = await contractUtils.estimateApprove(
      inputCurrency.address,
      inputCurrency.exchangeAddress
    );
    gasLimits = concat(gasLimits, unlockGasLimit);
  }

  const swapGasLimit = await estimateSwapGasLimit({
    accountAddress,
    chainId,
    tradeDetails,
    useV1,
  });
  gasLimits = concat(gasLimits, swapGasLimit);

  return reduce(gasLimits, (acc, limit) => add(acc, limit), '0');
};

const createUnlockAndSwapRap = async ({
  callback,
  inputAmount,
  inputCurrency,
  outputCurrency,
  selectedGasPrice,
  tradeDetails,
  useV1,
}) => {
  // create unlock rap
  const { accountAddress, chainId } = store.getState().settings;

  let actions = [];

  const swapAssetNeedsUnlocking = await assetNeedsUnlocking(
    accountAddress,
    inputAmount,
    inputCurrency,
    inputCurrency.exchangeAddress
  );
  if (swapAssetNeedsUnlocking) {
    const unlock = createNewAction(RapActionTypes.unlock, {
      accountAddress,
      amount: inputAmount,
      assetToUnlock: inputCurrency,
      contractAddress: inputCurrency.exchangeAddress,
    });
    actions = concat(actions, unlock);
  }

  // create a swap rap
  const swap = createNewAction(RapActionTypes.swap, {
    accountAddress,
    chainId,
    inputAmount,
    inputCurrency,
    outputCurrency,
    selectedGasPrice,
    tradeDetails,
    useV1,
  });
  actions = concat(actions, swap);

  // create the overall rap
  const newRap = createNewRap(actions, callback);

  // update the rap store
  const { dispatch } = store;
  dispatch(rapsAddOrUpdate(newRap.id, newRap));
  return newRap;
};

export default createUnlockAndSwapRap;
