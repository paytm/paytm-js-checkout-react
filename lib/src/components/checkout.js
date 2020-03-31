import React, { Component } from 'react';
import { CheckoutJsContext } from './checkout-provider';
import CONSTANTS from '../constants';

/**
 * The component is responsible for invoking and displaying the payment page. 
 * It should be always nested inside CheckoutProvider component. 
 * 
 * Example
 * <CheckoutProvider config={config}>
 *   <Checkout />
 * </CheckoutProvider>
 * 
 * @class Checkout
 * @extends {Component}
 */
class Checkout extends Component {
    static contextType = CheckoutJsContext;
    checkoutJsInstance = null;

    state = {
        elementId: ''
    };

    componentDidMount() {
        this.setState({
            elementId: this.context && this.context.elementId
        },
            () => {
                this.invoke(this.context.checkoutJsInstance);
            }
        );
    }

    componentDidUpdate() {
        const prevCheckoutJsInstance = this.checkoutJsInstance;
        const currentCheckoutJsInstance = this.context.checkoutJsInstance;

        if (currentCheckoutJsInstance &&
            prevCheckoutJsInstance !== currentCheckoutJsInstance) {
            this.invoke(currentCheckoutJsInstance);
        }
    }

    invoke(checkoutJsInstance) {
        this.checkoutJsInstance = checkoutJsInstance;

        if (checkoutJsInstance && checkoutJsInstance.invoke) {
            try {
                checkoutJsInstance.invoke();
            } catch (error) {
                console.error(CONSTANTS.ERRORS.INVOKE, error);
            }
        }
    }

    render() {
        return <div id={this.state.elementId}></div>;
    }
}

export default Checkout;
