/*
* Action setLoading
*/
export function setLoading(context, payload) {
  context.commit('SET_LOADING', payload);
}

/**
 * Action setSelectedAccount
 */
export function setSelectedAccount(context, payload) {
  context.commit('SET_SELECTED_ACCOUNT', payload);
}

/**
 * Action setAuthenticatedAccount
 */
export function setAuthenticatedAccount(context, payload) {
  context.commit('SET_AUTHENTICATED_ACCOUNT', payload);
}

/*
* Action setLayout
*/
export function setLayout(context, payload) {
  context.commit('SET_LAYOUT', payload);
}

/*
* Action setCurrency
*/
export function setCurrency(context, payload) {
  context.commit('SET_CURRENCY', payload);
}

export function setDisablePullToRefresh(context, payload) {
  context.commit('SET_DISABLE_PULLTOREFRESH', payload);
}

export function setPaymentLoading(context, payload) {
  context.commit('SET_PAYMENT_LOADING', payload);
}

export function setWalletConnectRequestStatus(context, payload) {
  context.commit('SET_WALLET_CONNECT_REQUEST', payload);
}
/**
 * Action setWalletType
 */
export function setWalletType(context, payload) {
  context.commit('SET_WALLET_TYPE', payload);
}
