import React, { Component } from 'react';
import CONFIG from '../../mocks/merchant-config';
import { CheckoutProvider, Checkout } from 'paytm-blink-checkout-react';
import InjectedCheckout from './injected-checkout';

const USE_EXISTING_CHECKOUT_INSTANCE = 'Use existing checkout instance : ';

class App extends Component {
  textAreaRef = React.createRef();

  constructor(props) {
    super(props);

    this.state = {
      config: this.appendHandler(CONFIG),
      showCheckout: false,
      openInPopup: true,
      checkoutJsInstance: null
    };
  }

  appendHandler(config) {
    const newConfig = { ...config };

    newConfig.handler = {
      notifyMerchant: this.notifyMerchantHandler
    }

    return newConfig;
  }

  notifyMerchantHandler = (eventType, data) => {
    console.log('MERCHANT NOTIFY LOG', eventType, data);
  }

  renderUpdateConfig = () => {
    this.setState({
      config: this.getUpdatedConfig()
    });
  }

  getUpdatedConfig() {
    const config = this.parse(this.textAreaRef.current.value);

    return this.appendHandler(config);
  }

  parse(value) {
    try {
      return JSON.parse(value)
    }
    catch (err) {
      console.error("Invalid config JSON");
      return {};
    }
  }

  toggleOpenInPopup = () => {
    this.setState((prevState, _) => ({
      openInPopup: !prevState.openInPopup
    }));
  }

  toggleCheckout = () => {
    this.setState((prevState, _) => ({
      showCheckout: !prevState.showCheckout
    }));
  }

  loadCheckoutScript = () => {
    const url = 'https://pgp-hotfix.paytm.in/merchantpgpui/checkoutjs/merchants/';
    const scriptElement = document.createElement('script');
    scriptElement.async = true;
    scriptElement.src = url.concat(CONFIG.merchant.mid);
    scriptElement.type = 'application/javascript';
    scriptElement.onload = () => {
      const checkoutJsInstance = this.getCheckoutJsObj();

      if (checkoutJsInstance && checkoutJsInstance.onLoad) {
        checkoutJsInstance.onLoad(() => {
          this.setState({
            config: this.getUpdatedConfig(),
            checkoutJsInstance
          });
        });
      }
      else {
        console.error(USE_EXISTING_CHECKOUT_INSTANCE + 'onload not available!');
      }
    };
    scriptElement.onerror = error => {
      console.error(USE_EXISTING_CHECKOUT_INSTANCE + 'script load fail!');
    }
    document.body.appendChild(scriptElement);
  }

  getCheckoutJsObj() {
    if (window && window.Paytm && window.Paytm.CheckoutJS) {
      return window.Paytm.CheckoutJS;
    }
    else {
      console.error(USE_EXISTING_CHECKOUT_INSTANCE + 'Checkout instance not found!');
    }

    return null;
  }

  render() {
    const { showCheckout, openInPopup, config } = this.state;
    const textAreaVal = JSON.stringify(config, null, 4);

    return (
      <div>
        <textarea cols="50"
          rows="25"
          defaultValue={textAreaVal}
          ref={this.textAreaRef} />
        <div>
          <button type="button"
            onClick={this.toggleCheckout}>
            Toggle Checkout Screen
          </button>
          <button type="button"
            onClick={this.renderUpdateConfig}>
            Re-render updated config
          </button>
          <button type="button"
            onClick={this.loadCheckoutScript}>
            Use existing checkout instance
          </button>
          <input type="checkbox" onClick={this.toggleOpenInPopup}
            defaultChecked={openInPopup}>
          </input> Open in popup
        </div>
        <br />

        <div><b>CHECKOUT VISIBILITY :</b> {showCheckout.toString()}</div>
        <CheckoutProvider config={this.state.config}
          checkoutJsInstance={this.state.checkoutJsInstance}
          openInPopup={openInPopup} 
          env="STAGE">
          <InjectedCheckout />
          {showCheckout && <Checkout />}
        </CheckoutProvider>
      </div>
    );
  }
}

export default App;
