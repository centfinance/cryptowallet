/**
 * State mutation for salt.
 * @param state
 * @param salt
 * @constructor
 */
export function SET_SALT(state, salt) {
  state.salt = salt;
}

/**
 * State mutation for pin hash.
 * @param state
 * @param pinHash
 * @constructor
 */
export function SET_PIN_HASH(state, pinHash) {
  state.pinHash = pinHash;
}

/**
 * State mutation for pin hash.
 * @param state
 * @param pinHashConfirm
 * @constructor
 */
export function SET_PIN_HASH_CONFIRM(state, pinHashConfirm) {
  state.pinHashConfirm = pinHashConfirm;
}

/**
 * State mutation for seed.
 * @param state
 * @param seed
 * @constructor
 */
export function SET_SEED(state, seed) {
  state.seed = {};
  for (let i = 0; i < seed.length; i += 1) {
    state.seed[seed[i]] = seed[i];
  }
}

export function SET_SEED_STRING(state, seed) {
  state.seedString = seed;
}

/**
 * SET STATE for seet counter
 */
export function SET_SPV_MODE(state, payload) {
  state.spvMode = payload;
}

/**
 * SET ACCOUNT NAME
 */
export function SET_ACCOUNT_NAME(state, payload) {
  state.accountName = payload;
}

/**
 * SET ACCOUNT NAME
 */
export function SET_ACCOUNT_EMAIL(state, payload) {
  state.accountEmail = payload;
}

/**
 * SET ACCOUNT CURRENCY
 */
export function SET_ACCOUNT_CURRENCY(state, payload) {
  state.accountCurrency = payload;
}

/**
 * SET ACCOUNT TYPE
 */
export function SET_ACCOUNT_TYPE(state, payload) {
  state.accountType = payload;
}

/**
 * SET ACCOUNT LOCALE
 */
export function SET_ACCOUNT_LOCALE(state, payload) {
  state.accountLocale = payload;
}

/**
 * SET ACCOUNT IP NODE
 */
export function SET_ACCOUNT_IP_NODE(state, payload) {
  state.accountIpNode = payload;
}

/**
 * State mutation for account created
 */
export function SET_ACCOUNT_CREATED(state) {
  state.accountCreated = true;
}

/**
 * State mutation for pin array
 */
export function SET_PIN(state, payload) {
  if (!Array.isArray(state.pinArray)) { state.pinArray = []; }
  const pinArray = state.pinArray.slice();
  pinArray.push(payload.value);
  state.pinArray = pinArray;
}

/**
 * State mutation for pin confirmation array
 */
export function SET_PIN_CONFIRM(state, payload) {
  if (!Array.isArray(state.pinConfirmArray)) { state.pinConfirmArray = []; }
  const pinConfirmArray = state.pinConfirmArray.slice();
  pinConfirmArray.push(payload.value);
  state.pinConfirmArray = pinConfirmArray;
}

/**
 * State mutation for demo mode
 */
export function SET_DEMO_MODE(state, payload) {
  state.demoMode = payload;
}

/**
 * State mutation for walletType
 */
export function SET_WALLET_TYPE(state, payload) {
  state.walletType = payload;
}

/**
 * Reset pin array
 */
export function RESET_PIN(state) {
  state.pinArray = [];
}

/**
 * Reset pin confirm array
 */
export function RESET_PIN_CONFIRM(state) {
  state.pinConfirmArray = [];
}

/**
 * Clear setup data
 */
export function CLEAR_SETUP_DATA(state) {
  state.accountIpNode = null;
  state.accountLocale = null;
  state.accountName = null;
  state.accountType = null;
  state.accountCreated = null;
  state.pinArray = null;
  state.pinConfirmArray = null;
  state.salt = null;
  state.seed = null;
  state.spvMode = null;
}

/**
 * Set GetStarted modal opened
 */
export function SET_GETSTARTED_MODAL_OPENED(state, payload) {
  state.getStartedModalOpened = payload;
}
