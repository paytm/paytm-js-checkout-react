import React, { Component, useRef } from 'react';
import { merchantConfig, integrationConfig, merchantHandlers } from '../mocks/merchant-config';
import { CheckoutProvider, Checkout } from 'paytm-blink-checkout-react';
import InjectedCheckout from './injected-checkout';
import { useState } from 'react';

const USE_EXISTING_CHECKOUT_INSTANCE = 'Use existing checkout instance : ';

const appendHandler = (config) => {
  const newConfig = { ...config };
  newConfig.handler = {
    ...merchantHandlers,
  }
  return newConfig;
}

function App() {
  const [mConfig, setMConfig] = useState(appendHandler(merchantConfig))
  const [iConfig, setIConfig] = useState(integrationConfig)
  const [showCheckout, setShowCheckout] = useState(false);
  const [openInPopup, setOpenInPopup] = useState(true);
  const [checkoutJsInstance, setCheckoutJsInstance] = useState(null);

  const mConfigTextAreaRef = useRef();
  const iConfigTextAreaRef = useRef();

  const mConfigTextAreaVal = JSON.stringify(mConfig, null, 4);
  const iConfigTextAreaVal = JSON.stringify(iConfig, null, 4);

  const parse = (value) => {
    try {
      return JSON.parse(value);
    }
    catch (err) {
      console.error("Invalid config JSON");
      return {};
    }
  }

  const getUpdatedMerchantConfig = () => {
    const config = parse(mConfigTextAreaRef.current.value);
    return appendHandler(config);
  }

  const getUpdatedIntegrationConfig = () => {
    const config = parse(iConfigTextAreaRef.current.value);
    return config;
  }

  const toggleCheckout = () => {
    setShowCheckout(!showCheckout);
  }

  const renderUpdateConfig = () => {
    setMConfig(getUpdatedMerchantConfig());
    setIConfig(getUpdatedIntegrationConfig());
  }

  const toggleOpenInPopup = () => {
    setOpenInPopup(!openInPopup);
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
          setIConfig(getUpdatedIntegrationConfig());
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

  return(
    <div>
      <div>
        <textarea
          cols="70"
          rows="25"
          defaultValue={mConfigTextAreaVal}
          ref={mConfigTextAreaRef} 
        />
      </div>
      <div>
        <textarea
          cols="70"
          rows="7"
          defaultValue={iConfigTextAreaVal}
          ref={iConfigTextAreaRef} 
        />
      </div>
      <div>
        <button type="button" onClick={toggleCheckout}>Toggle Checkout Screen</button>
        <button type="button" onClick={renderUpdateConfig}>Re-render updated config</button>
        <button type="button" onClick={loadCheckoutScript}>Use existing checkout instance</button>
        
        <input 
          type="checkbox" 
          onClick={toggleOpenInPopup}
          defaultChecked={openInPopup}>
        </input> Open in popup
      </div>
      <br />

      <div>
        <b>CHECKOUT VISIBILITY :</b> {showCheckout.toString()}
      </div>

      <CheckoutProvider 
        config={mConfig}
        checkoutJsInstance={checkoutJsInstance}
        openInPopup={openInPopup} 
        env="STAGE"
      >
        <InjectedCheckout />
        {showCheckout && <Checkout />}
      </CheckoutProvider>
    </div>
  );
}

export default App;
