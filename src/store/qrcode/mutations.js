/*
* SET STATE for scanning qr code
*/
export function SCAN_QR_CODE(state) {
  state.scanning = true;
}

/*
 * SET STATE cancel scanning
 */
export function CANCEL_SCANNING(state) {
  state.scanning = false;
}

/*
 * SET STATE scanned address
 */
export function SET_SCANNED_ADDRESS(state, payload) {
  state.scannedAddress = payload;
}

/*
 * SET STATE scanned amount
 */
export function SET_SCANNED_AMOUNT(state, payload) {
  state.scannedAmount = payload;
}

/*
 * SET STATE scanned amount
 */
export function SET_SCANNED_URI(state, payload) {
  state.scannedURI = payload;
}

/*
 * SET STATE qrMode
 */
export function SET_QR_MODE(state, payload) {
  state.qrMode = payload;
}
