import { filter, get, omit, values } from 'lodash';
import {
  getLocalRequests,
  removeLocalRequest,
  saveLocalRequests,
} from '../handlers/localstorage/walletconnect';
import { getRequestDisplayDetails } from '../parsers/requests';
import { logger } from '../utils';

// -- Constants --------------------------------------- //
const REQUESTS_UPDATE_REQUESTS_TO_APPROVE =
  'requests/REQUESTS_UPDATE_REQUESTS_TO_APPROVE';
const REQUESTS_CLEAR_STATE = 'requests/REQUESTS_CLEAR_STATE';

// Requests expire automatically after 1 hour
const EXPIRATION_THRESHOLD_IN_MS = 1000 * 60 * 60;

export const requestsLoadState = () => async (dispatch, getState) => {
  const { accountAddress, network } = getState().settings;
  try {
    const requests = await getLocalRequests(accountAddress, network);
    const _requests = requests || {};
    dispatch({ payload: _requests, type: REQUESTS_UPDATE_REQUESTS_TO_APPROVE });
    // eslint-disable-next-line no-empty
  } catch (error) {}
};

export const addRequestToApprove = (
  clientId,
  peerId,
  requestId,
  payload,
  peerMeta
) => (dispatch, getState) => {
  const { requests } = getState().requests;
  const { accountAddress, network, nativeCurrency } = getState().settings;
  const { assets } = getState().data;
  const displayDetails = getRequestDisplayDetails(
    payload,
    assets,
    nativeCurrency
  );
  const oneHourAgoTs = Date.now() - EXPIRATION_THRESHOLD_IN_MS;
  if (displayDetails.timestampInMs < oneHourAgoTs) {
    logger.log('request expired!');
    return;
  }

  const dappName = peerMeta.name || 'Unknown Dapp';
  const imageUrl = get(peerMeta, 'icons[0]');
  const request = {
    clientId,
    dappName,
    displayDetails,
    imageUrl,
    payload,
    peerId,
    requestId,
  };
  const updatedRequests = { ...requests, [requestId]: request };
  dispatch({
    payload: updatedRequests,
    type: REQUESTS_UPDATE_REQUESTS_TO_APPROVE,
  });
  saveLocalRequests(updatedRequests, accountAddress, network);
  return request;
};

export const requestsForTopic = topic => (dispatch, getState) => {
  const { requests } = getState().requests;
  return filter(values(requests), { clientId: topic });
};

export const requestsResetState = () => dispatch =>
  dispatch({ type: REQUESTS_CLEAR_STATE });

export const removeRequest = requestId => (dispatch, getState) => {
  const { accountAddress, network } = getState().settings;
  const { requests } = getState().requests;
  const updatedRequests = omit(requests, [requestId]);
  removeLocalRequest(accountAddress, network, requestId);
  dispatch({
    payload: updatedRequests,
    type: REQUESTS_UPDATE_REQUESTS_TO_APPROVE,
  });
};

// -- Reducer ----------------------------------------- //
const INITIAL_STATE = {
  requests: {},
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case REQUESTS_UPDATE_REQUESTS_TO_APPROVE:
      return {
        ...state,
        requests: action.payload,
      };
    case REQUESTS_CLEAR_STATE:
      return {
        ...state,
        ...INITIAL_STATE,
      };
    default:
      return state;
  }
};
