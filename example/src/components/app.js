import React, { Component , useRef, useState} from 'react';
import CONFIG from '../../mocks/merchant-config';
import { CheckoutProvider, Checkout } from 'paytm-blink-checkout-react';
import InjectedCheckout from './injected-checkout';

const USE_EXISTING_CHECKOUT_INSTANCE = 'Use existing checkout instance : ';

const appendHandler = (config) => {
  const newConfig = { ...config };
  newConfig.handler = {
    notifyMerchant: notifyMerchantHandler
  }
  return newConfig;
}

const notifyMerchantHandler = (eventType, data) => {
  console.log('MERCHANT NOTIFY LOG', eventType, data);
}

function App() {

  const [mConfig, setMConfig] = useState(appendHandler(CONFIG))
  const [showCheckout, setShowCheckout] = useState(false);
  const [openInPopup, setOpenInPopup] = useState(true);
  const [checkoutJsInstance, setCheckoutJsInstance] = useState(null);

  const mConfigTextAreaRef = useRef();
  const mConfigTextAreaVal = JSON.stringify(mConfig, null, 4);

  
  // notifyMerchantHandler = (eventType, data) => {
  //   console.log('MERCHANT NOTIFY LOG', eventType, data);
  // }

  const renderUpdateConfig = () => {
    setMConfig(getUpdatedMerchantConfig());
  }

  const getUpdatedMerchantConfig= () => {
    const config = parse(mConfigTextAreaRef.current.value);

    return appendHandler(config);
  }

  const parse = (value) => {
    try {
      return JSON.parse(value)
    }
    catch (err) {
      console.error("Invalid config JSON");
      return {};
    }
  }

  const toggleOpenInPopup = () => {
    setOpenInPopup(!openInPopup);
  }
  const toggleCheckout = () => {
    setShowCheckout(!showCheckout);
  }

  const loadCheckoutScript = () => {
    const url = 'https://securegw.paytm.in/merchantpgpui/checkoutjs/merchants/';
    const scriptElement = document.createElement('script');
    scriptElement.async = true;
    scriptElement.src = url.concat(mConfig.merchant.mid);
    scriptElement.type = 'application/javascript';
    scriptElement.onload = () => {
      const checkoutJsInstance = getCheckoutJsObj();

      if (checkoutJsInstance && checkoutJsInstance.onLoad) {
        checkoutJsInstance.onLoad(() => {
          setMConfig(getUpdatedMerchantConfig());
          setCheckoutJsInstance(checkoutJsInstance);
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

  const getCheckoutJsObj = () => {
    if (window && window.Paytm && window.Paytm.CheckoutJS) {
      return window.Paytm.CheckoutJS;
    }
    else {
      console.error(USE_EXISTING_CHECKOUT_INSTANCE + 'Checkout instance not found!');
    }

    return null;
  }

   

    return (
      <div>
        <textarea cols="50"
          rows="25"
          defaultValue={mConfigTextAreaVal}
          ref={mConfigTextAreaRef} />
        <div>
          <button type="button"
            onClick={toggleCheckout}>
            Toggle Checkout Screen
          </button>
          <button type="button"
            onClick={renderUpdateConfig}>
            Re-render updated config
          </button>
          <button type="button"
            onClick={loadCheckoutScript}>
            Use existing checkout instance
          </button>
          <input type="checkbox" onClick={toggleOpenInPopup}
            defaultChecked={openInPopup}>
          </input> Open in popup
        </div>
        <br />

        <div><b>CHECKOUT VISIBILITY :</b> {showCheckout.toString()}</div>
        <CheckoutProvider config={mConfig}
          checkoutJsInstance={checkoutJsInstance}
          openInPopup={openInPopup} 
          env="STAGE">
          <InjectedCheckout />
          {showCheckout && <Checkout />}
        </CheckoutProvider>
      </div>
    );
  
}

export default App;
