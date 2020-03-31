import React, { Component } from 'react';
import CONSTANTS from '../constants';

export const CheckoutJsContext = React.createContext(null);

function isTrue(value) {
    return (typeof value === 'boolean') ?
        value :
        (typeof value === 'string') ?
            value === 'true' :
            false;
}

/**
 * The component is responsible for setting up Checkout JS library. 
 * It sets the Checkout JS instance and make it available to all its children 
 * component via React Context Provider.  It requires config property which is 
 * mandatory is order to initialize Checkout JS library. Additionally openInPopup 
 * prop can also be passed to show checkout in popup or not, by default its 
 * value is true.
 * The  config should be of same format as the  Checkout JS library, which 
 * could be checked from this 
 * [link](https://staticpg.paytm.in/checkoutjs/21/docs/#/configuration).
 * 
 * Example
 * <CheckoutProvider config={config} openInPopup="false">
 * </CheckoutProvider>
 * 
 * @class CheckoutProvider
 * @extends {Component}
 */
class CheckoutProvider extends Component {
    elementId = CONSTANTS.IDS.CHECKOUT_ELEMENT + (new Date()).getTime();
    isScriptLoaded = false;
    isScriptLoading = false;

    state = {
        checkoutJsInstance: null
    };

    componentDidMount() {
        this.preSetup();
    }


    componentDidUpdate(prevProps) {
        const isPropChanged = ['config', 'checkoutJsInstance', 'openInPopup']
            .some(propName => prevProps[propName] !== this.props[propName]);

        if (isPropChanged) {
            this.preSetup();
        }
    }

    preSetup() {
        const { config, checkoutJsInstance } = this.props;
        const merchantId = config.merchant && config.merchant.mid;

        if (!merchantId) {
            console.error(CONSTANTS.ERRORS.MERCHANT_ID_NOT_FOUND);
            return;
        }

        if (checkoutJsInstance || this.isScriptLoaded) {
            this.initializeCheckout();
        }
        else if (!this.isScriptLoading) {
            this.loadCheckoutScript(merchantId);
        }
    }

    loadCheckoutScript(merchantId) {
        const scriptElement = document.createElement('script');
        scriptElement.async = true;
        scriptElement.src = CONSTANTS.LINKS.CHECKOUT_JS_URL.concat(merchantId);
        scriptElement.type = 'application/javascript';
        scriptElement.onload = this.setupCheckoutJsOnScriptLoad;
        scriptElement.onerror = error => {
            console.error(CONSTANTS.ERRORS.FAILED_TO_LOAD_SCRIPT, error);
            this.isScriptLoading = false;
        }
        document.body.appendChild(scriptElement);
        this.isScriptLoading = true;
    }

    setupCheckoutJsOnScriptLoad = () => {
        this.isScriptLoading = false;
        this.isScriptLoaded = true;
        const checkoutJsInstance = this.getCheckoutJsObj();

        if (checkoutJsInstance && checkoutJsInstance.onLoad) {
            checkoutJsInstance.onLoad(() => {
                this.initializeCheckout();
            });
        }
        else {
            console.error(CONSTANTS.ERRORS.INVALID_CHECKOUT_JS_INSTANCE);
        }
    }

    initializeCheckout = () => {
        const { openInPopup = true } = this.props;
        // Set checkoutJsInstance via shallow copy so that invoke method in 
        // checkout component can be invoked via shallow comparison.
        const checkoutJsInstance = { ...this.getCheckoutJsObj() };

        if (!checkoutJsInstance) {
            return;
        }

        if (checkoutJsInstance.init && checkoutJsInstance.invoke) {
            checkoutJsInstance
                .init({
                    ...this.props.config,
                    root: isTrue(openInPopup) ? '' : `#${this.elementId}`
                }).then(_ => {
                    this.setState({ checkoutJsInstance });
                })
                .catch((error) => {
                    console.error(CONSTANTS.ERRORS.INIT, error);
                });
        } else {
            console.error(CONSTANTS.ERRORS.INVALID_CHECKOUT_JS_INSTANCE);
        }
    }

    getCheckoutJsObj() {
        if (this.props.checkoutJsInstance) {
            return this.props.checkoutJsInstance;
        }

        if (window && window.Paytm && window.Paytm.CheckoutJS) {
            return window.Paytm.CheckoutJS;
        }

        console.warn(CONSTANTS.ERRORS.CHECKOUT_NOT_AVAILABLE);
        return null;
    }

    render() {
        const { checkoutJsInstance } = this.state;

        return (
            <CheckoutJsContext.Provider value={({
                checkoutJsInstance,
                elementId: this.elementId,
            })}>
                {this.props.children}
            </CheckoutJsContext.Provider>
        );
    }
}

export default CheckoutProvider;
