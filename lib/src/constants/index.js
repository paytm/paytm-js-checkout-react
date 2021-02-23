const CONSTANTS = {
    PROJECT_NAME: 'Paytm Blink Checkout JS',
    ENV: {
        PROD: 'PROD',
        STAGE: 'STAGE'
    },
    HOSTS: {
        PROD: 'https://securegw.paytm.in',
        STAGE: 'https://securegw-stage.paytm.in'
    },
    LINKS: {
        CHECKOUT_JS_URL: '/merchantpgpui/checkoutjs/merchants/'
    },
    ERRORS: {
        INIT: 'An error during initialization!',
        INVOKE: 'An error during invoking!',
        MERCHANT_ID_NOT_FOUND: 'Please provide merchant id!',
        CHECKOUT_NOT_AVAILABLE: 'Checkout JS library not found. Please make sure you have included checkout js!',
        INVALID_CHECKOUT_JS_INSTANCE: 'Invalid instance provided!',
        FAILED_TO_LOAD_SCRIPT: 'Failed to load script!'
    },
    IDS: {
        CHECKOUT_ELEMENT: 'paytm-checkout-wrapper-'
    }
};

// Prefix error with project name
Object.keys(CONSTANTS.ERRORS).forEach(errorCode => {
    CONSTANTS.ERRORS[errorCode] = `${CONSTANTS.PROJECT_NAME}: ${CONSTANTS.ERRORS[errorCode]}`;
});

export default CONSTANTS;
