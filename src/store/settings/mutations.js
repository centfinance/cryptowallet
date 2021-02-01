/*
 * SET STATE for app loading
 */
export function SET_LOADING(state, payload) {
  state.loading = payload;
}

/**
 * SET_SELECTED_ACCOUNT mutation
 */
export function SET_SELECTED_ACCOUNT(state, payload) {
  state.selectedAccount = payload;
}

/**
 * SET_AUTHENTICATED_ACCOUNT mutation
 */
export function SET_AUTHENTICATED_ACCOUNT(state, payload) {
  state.authenticatedAccount = payload;
}

/*
 * SET STATE for app layout
 */
export function SET_LAYOUT(state, payload) {
  state.layout = payload;
}

/*
 * SET_CURRENCY mutation
 */
export function SET_CURRENCY(state, payload) {
  state.selectedCurrency = payload;
}

export function SET_DISABLE_PULLTOREFRESH(state, payload) {
  state.disablePullToRefresh = payload;
}

export function SET_PAYMENT_LOADING(state, payload) {
  state.paymentLoading = payload;
}
// Set Wallet Connect Requests Status
export function SET_WALLET_CONNECT_REQUEST(state, payload) {
  state.wcRequestPending = payload;
}
