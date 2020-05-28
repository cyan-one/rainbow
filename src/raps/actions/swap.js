import { find, get, toLower } from 'lodash';
import {
  calculateTradeDetails,
  estimateSwapGasLimit,
  executeSwap,
} from '../../handlers/uniswap';
import ProtocolTypes from '../../helpers/protocolTypes';
import TransactionStatusTypes from '../../helpers/transactionStatusTypes';
import TransactionTypes from '../../helpers/transactionTypes';
import {
  convertHexToString,
  convertRawAmountToDecimalFormat,
  isZero,
} from '../../helpers/utilities';
import { dataAddNewTransaction } from '../../redux/data';
import { rapsAddOrUpdate } from '../../redux/raps';
import store from '../../redux/store';
import {
  TRANSFER_EVENT_KECCAK,
  TRANSFER_EVENT_TOPIC_LENGTH,
} from '../../references';
import { ethereumUtils, gasUtils, logger } from '../../utils';

const NOOP = () => undefined;

export const isValidSwapInput = ({
  inputAmount,
  inputCurrency,
  inputReserve,
  outputAmount,
  outputCurrency,
  outputReserve,
}) => {
  const isMissingAmounts = !inputAmount || !outputAmount;
  const isMissingCurrency = !inputCurrency || !outputCurrency;
  const isMissingReserves =
    (get(inputCurrency, 'address') !== 'eth' && !inputReserve) ||
    (get(outputCurrency, 'address') !== 'eth' && !outputReserve);

  return !(isMissingAmounts || isMissingCurrency || isMissingReserves);
};

export const findSwapOutputAmount = (receipt, accountAddress) => {
  const { logs } = receipt;
  const transferLog = find(logs, log => {
    const { topics } = log;
    const isTransferEvent =
      topics.length === TRANSFER_EVENT_TOPIC_LENGTH &&
      toLower(topics[0]) === TRANSFER_EVENT_KECCAK;
    if (!isTransferEvent) return false;

    const transferDestination = topics[2];
    const cleanTransferDestination = toLower(
      ethereumUtils.removeHexPrefix(transferDestination)
    );
    const addressNoHex = toLower(ethereumUtils.removeHexPrefix(accountAddress));
    const cleanAccountAddress = ethereumUtils.padLeft(addressNoHex, 64);

    return cleanTransferDestination === cleanAccountAddress;
  });
  if (!transferLog) return null;
  const { data } = transferLog;
  return convertHexToString(data);
};

// TODO MICHAL - Step I - execute the swap rap
const swap = async (wallet, currentRap, index, parameters) => {
  logger.log('[swap] swap on uniswap!');
  const {
    accountAddress,
    chainId,
    inputAmount,
    inputAsExactAmount,
    inputCurrency,
    inputReserve,
    outputAmount,
    outputCurrency,
    outputReserve,
    selectedGasPrice = null,
  } = parameters;
  const { dispatch } = store;
  const { gasPrices } = store.getState().gas;
  logger.log('[swap] calculating trade details');

  // Get Trade Details
  const tradeDetails = calculateTradeDetails(
    chainId,
    inputAmount,
    inputCurrency,
    inputReserve,
    outputAmount,
    outputCurrency,
    outputReserve,
    inputAsExactAmount
  );

  // Execute Swap
  logger.log('[swap] execute the swap');
  let gasPrice = get(selectedGasPrice, 'value.amount');

  // if swap is not the final action, use fast gas
  if (currentRap.actions.length - 1 > index || !gasPrice) {
    gasPrice = get(gasPrices, `[${gasUtils.FAST}].value.amount`);
  }

  const gasLimit = await estimateSwapGasLimit(accountAddress, tradeDetails);

  logger.log('[swap] About to execute swap with', {
    gasLimit,
    gasPrice,
    tradeDetails,
    wallet,
  });

  const swap = await executeSwap(tradeDetails, gasLimit, gasPrice, wallet);
  logger.log('[swap] response', swap);
  currentRap.actions[index].transaction.hash = swap.hash;
  dispatch(rapsAddOrUpdate(currentRap.id, currentRap));
  logger.log('[swap] adding a new swap txn to pending', swap.hash);
  const newTransaction = {
    amount: inputAmount,
    asset: inputCurrency,
    from: accountAddress,
    hash: swap.hash,
    nonce: get(swap, 'nonce'),
    protocol: ProtocolTypes.uniswap.name,
    status: TransactionStatusTypes.swapping,
    to: get(swap, 'to'),
    type: TransactionTypes.trade,
  };
  logger.log('[swap] adding new txn', newTransaction);
  await dispatch(dataAddNewTransaction(newTransaction, true));
  logger.log('[swap] calling the callback');
  currentRap.callback();
  currentRap.callback = NOOP;

  try {
    logger.log('[swap] waiting for the swap to go thru');
    const receipt = await wallet.provider.waitForTransaction(swap.hash);
    logger.log('[swap] receipt:', receipt);
    if (!isZero(receipt.status)) {
      currentRap.actions[index].transaction.confirmed = true;
      dispatch(rapsAddOrUpdate(currentRap.id, currentRap));
      const rawReceivedAmount = findSwapOutputAmount(receipt, accountAddress);
      logger.log('[swap] raw received amount', rawReceivedAmount);
      logger.log('[swap] updated raps');
      const convertedOutput = convertRawAmountToDecimalFormat(
        rawReceivedAmount,
        outputCurrency.decimals
      );
      logger.log('[swap] updated raps', convertedOutput);
      return convertedOutput;
    } else {
      logger.log('[swap] status not success');
      currentRap.actions[index].transaction.confirmed = false;
      dispatch(rapsAddOrUpdate(currentRap.id, currentRap));
      return null;
    }
  } catch (error) {
    logger.log('[swap] error waiting for swap', error);
    currentRap.actions[index].transaction.confirmed = false;
    dispatch(rapsAddOrUpdate(currentRap.id, currentRap));
    return null;
  }
};

export default swap;
