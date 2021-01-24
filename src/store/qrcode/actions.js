/*
* Action scanQRCode
*/
export function scanQRCode(context) {
  context.commit('SCAN_QR_CODE');
}

/*
 * Action cancelScanning
 */
export function cancelScanning(context) {
  context.commit('CANCEL_SCANNING');
}

/*
 * Action setScannedAddress
 */
export function setScannedAddress(context, payload) {
  context.commit('SET_SCANNED_ADDRESS', payload);
}

/*
 * Action setScannedAmount
 */
export function setScannedAmount(context, payload) {
  context.commit('SET_SCANNED_AMOUNT', payload);
}

/*
 * Action setScannedURI
 */
export function setScannedURI(context, payload) {
  context.commit('SET_SCANNED_URI', payload);
}

/*
 * Action setQRMode
 */
export function setQRMode(context, payload) {
  context.commit('SET_QR_MODE', payload);
}
