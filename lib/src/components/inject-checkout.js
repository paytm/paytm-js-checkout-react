import React, { Component } from 'react';
import { CheckoutJsContext } from './checkout-provider';

/**
 * The higher order component injects Checkout JS instance to the wrapped component 
 * and make it available in the wrapped component props as checkoutJsInstance . 
 * The instance allows to directly interact with CheckoutJs library . 
 * The  injected component should be always nested inside CheckoutProvider component. 
 *
 * Example
 * 
 * Component that makes use of checkoutJsInstance prop. 
 * function Test(props) { 
 *  const checkoutJsInstance = props.checkoutJsInstance;
 *  return <div>Hello!</div>;
 * }
 * 
 * Wrap component in a higher order component which provides checkoutJsInstance prop.
 * const InjectedComponent = injectCheckout(Test);
 * 
 * Render the wrapped component
 * <CheckoutProvider config={config}>
 *   <InjectedComponent />
 * </CheckoutProvider>
 * 
 * @param {Component} WrappedComponent Component that want to make use 
 * checkoutJsInstance from the props.
 * @returns Checkout JS instance injected component
 */
function injectCheckout(WrappedComponent, allContext = false) {
    return class extends Component {
        render() {
            return <CheckoutJsContext.Consumer>
                {(value) => {
                    const contextData = allContext ? value : {
                        checkoutJsInstance: value && value.checkoutJsInstance
                    };
                    return <WrappedComponent {...{...this.props, ...contextData}} />
                }}
            </CheckoutJsContext.Consumer>;
        }
    }
};

export default injectCheckout;