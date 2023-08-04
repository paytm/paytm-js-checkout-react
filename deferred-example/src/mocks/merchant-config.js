const merchantConfig = {
  flow: "DEFERRED",
  vertical: "RECHARGE",
  data: {
      orderId: "integration_20230110145736",
      amount: "1",
      token: "99611bc30217410f8aefdf3754f806cb1673342859221",
      tokenType: "SSO",
      userDetail: {
          mobileNumber: "",
          name: ""
      }
  },
  merchant: {
      mid: "INTEGR77698636129383",
      name: "",
      logo: "",
      redirect: true,
      hidePaytmBranding: true
  },
  mapClientMessage: {},
  labels: {},
  payMode: {
    labels: {},
    filter: {
        exclude: []
    },
    order: [
        "NB",
        "CARD",
        "LOGIN"
    ]
  }
};

const integrationConfig = {
    token: "99611bc30217410f8aefdf3754f806cb1673342859221",
    userId: "311131313",
    cartId: "ZxLhF28nNNiyRC0x.CEv0sKhoKq9TDiXeZyt1pw"
}

const merchantHandlers = {
    notifyMerchant: function (eventType, data) {
        console.log('notify merchant called', eventType, data);
    },
    transactionStatus: function (data) {
        console.log('transactionStatus merchant called', data);
    },
    deferred: function (eventType, data) {
      console.log("deferred handler called")
      let cartId = integrationConfig['cartId'];
      let token = integrationConfig.token;
      let userId = integrationConfig.userId;
      let payload;
      let cart_items = [
        {
          product_id: 19999,
          qty: 1,
          configuration: {
            price: merchantConfig.data.amount
          }
        }
      ];
      return new Promise(function (resolve, reject) {
        if(!cartId || !token) {
          return reject({"status":"F","message":'Cart Id and token reqd'});
        }
        if (eventType === 'FETCH_PAYMODE') {
          console.log('event: FETCH_PAYMODE is called in deferred handler', { data, cart_items });
          payload = {
            method: 'POST',
            // targetURL: 'http://localhost:3000/v5/cart/' + cartId + '?fetch_emi_details=1&&payment_info=1&native_withdraw=1&site_id=2&client=web&version=2',
            // targetURL: 'http://localhost:3000/v4/cart/'  + cartId + '?client=html5&channel=html5&child_site_id=373&site_id=31&version=3&payment_info=1&native_withdraw=1&discoverability=offline&storewid=1026330&service_type=self-pick-up',
            targetURL: 'http://localhost:3000/v2/order/verify?payment_info=1&sso_token=' + token + '&native_withdraw=1&client=web&version=2',
            requestPayload: {	
              cart_items,	
              payment_intent: data	
            }
          };
          _ajaxTemplate(
            payload,
            function (res) {
              if (res.cart && res.cart.error) {
                return reject({ status: 'F', message: res.cart.error });
              }
              resolve({
                cart: res.cart,
                payment_instruments: res.cart ? res.cart['payment_instruments'] : res.body.cart['payment_instruments'],
                paymentInfo: res.cart ? res.cart['paymentInfo'] : res.body.cart['paymentInfo'],
                fee_details: res.cart ? res.cart['fee_details'] : res.body.cart['fee_details'],
                isPcfEnabled: true
              });
            },
            function (error) {
              console.log('error called fetch paymode', error);
              return reject({ status: 'F', message: 'Something went wrong' });
            }
          );
        }
        if (eventType === 'INITIATE_TXN') {
          console.log('event: INITIATE_TXN is called in deferred handler', { data, cart_items });
          //   return reject({"status":"F","message":'Error in initiate Txn'});
          var walletConvFee = data.walletConvFee;
          cart_items[0]['wallet_conv_fee'] = walletConvFee;
          data.cart_items = cart_items;

          delete data.walletConvFee;
          delete data.payment_intent[0]['txnAmount'];
          payload = {
            method: 'POST',
            // targetURL: 'http://localhost:3000/v5/checkout/' + cartId +'/placeorder?site_id=2&child_site_id=6&native_withdraw=1&client=web&version=2',
            // targetURL: 'http://localhost:3000/v4/checkout/' + cartId +'/placeorder?client=html5&channel=html5&child_site_id=373&site_id=31&version=3&payment_info=1&native_withdraw=1',
            targetURL: 'http://localhost:3000/v2/deferredCheckout?&sso_token= ' + token + '&native_withdraw=1&client=web&version=2',
            requestPayload: data
          };
          console.log('payload in INITIATE_TXN', payload);
          _ajaxTemplate(
            payload,
            function (res) {
              if (!res['native_withdraw_details']) {
                return reject({ status: 'F', message: 'Error in initiate Txn' });
              }
              var resObj = {
                token: res['native_withdraw_details']['txnToken'],
                orderId: res['ORDER_ID'],
                status: res.status
              };
              return resolve(resObj);
            },
            function (err) {
              console.log('error ajax', err);
              return reject({ status: 'F', message: err.error });
            }
          );
        }
        if (eventType === 'NEW_PAYMODE_FEE_DETAILS') {
          console.log('event: NEW_PAYMODE_FEE_DETAILS is called in deferred handler', { data, cart_items });
          
          delete data.payment_intent.amount;
          payload = {
            method: 'POST',
            targetURL: 'http://localhost:3000/v2/order/verify?sso_token=' + token + '&native_withdraw=1&client=web&version=2',
            requestPayload: {
              payment_intent: data.payment_intent,
              cart_items: cart_items
            }
          };
          _ajaxTemplate(
            payload,
            function (res) {
              if (res.cart && res.cart.error) {
                return reject({ status: 'F', message: res.cart.error });
              }
              resolve({
                cart: res.cart,
                payment_instruments: res.cart ? res.cart['payment_instruments'] : res.body.cart['payment_instruments'],
                paymentInfo: res.cart ? res.cart['paymentInfo'] : res.body.cart['paymentInfo'],
                fee_details: res.cart ? res.cart['fee_details'] : res.body.cart['fee_details']
              });
            },
            function (error) {
              console.log('error called fetch paymode', error);
              return reject({ status: 'F', message: 'Something went wrong' });
            }
          );
        }
        if (eventType === 'FETCH_EMI_BANK_DETAILS') {
          console.log('event: FETCH_EMI_BANK_DETAILS is called in deferred handler', { data, cart_items });
          var payload = {
            method: 'GET',
            targetURL: 'http://localhost:3000/v5/cart/' + cartId + '?client=web&version=2&payment_info=1&native_withdraw=1&fetch_emi_details=1&site_id=2&emi_bank_details=1',
            requestPayload: data
          };
          _ajaxTemplate(
            payload,
            function (res) {
              if (res.cart && res.cart.error) {
                return reject({ status: 'F', message: res.cart.error });
              }
              resolve(res);
            },
            function (err) {
              console.log('error ajax', err);
              return reject({ status: 'F', message: err.error || 'Something went wrong' });
            }
          );
        }
        if (eventType === 'FETCH_EMI_PLANS') {
          console.log('event: FETCH_EMI_PLANS is called in deferred handler', { data, cart_items });
          var paymentIntentobj = data.payment_intent;
          var paymentOffersApplied = data.payment_offers_applied;
          delete data.payment_intent;
          delete data.payment_offers_applied;
          var payloadRequest = {
            action: 'setemifilter',
            object: {
              emi_filters: data,
              payment_intent: paymentIntentobj,
              payment_offers_applied: paymentOffersApplied
            }
          };

          console.log('payloadRequest in FETCH_EMI_PLANS', payloadRequest);
          // if (data.payment_intent) {
          //   payloadRequest.payment_intent = data.payment_intent;
          // }
          var payload = {
            method: 'POST',
            targetURL: 'http://localhost:3000/v5/cart/' + cartId + '?emi_bank_details=1&payment_info=1&native_withdraw=1&site_id=2&client=web&version=2',
            requestPayload: payloadRequest
          };
          _ajaxTemplate(
            payload,
            function (res) {
              if (res.cart && res.cart.error) {
                return reject({ status: 'F', message: res.cart.error });
              }
              resolve(res);
            },
            function (err) {
              console.log('error ajax', err);
              return reject({ status: 'F', message: err.error || 'Something went wrong' });
            }
          );
        }
        if (eventType === 'APPLY_EMI') {
          console.log('event: APPLY_EMI is called in deferred handler', { data, cart_items });

          var paymentIntentobj = data.payment_intent;
          var paymentOffersApplied = data.payment_offers_applied;
          delete data.payment_intent;
          delete data.payment_offers_applied;
          var payloadRequest = {
            action: 'setemiplan',
            object: {
              emi_plans: data,
              payment_intent: paymentIntentobj,
              payment_offers_applied: paymentOffersApplied
            }
          };
          if (data.payment_intent) {
            payloadRequest.payment_intent = data.payment_intent;
          }
          delete data.payment_intent;
          var payload = {
            method: 'POST',
            targetURL:
              'http://localhost:3000/v5/cart/' +
              cartId +
              '?payment_info=1&client=web&version=2&site_id=2',
            requestPayload: payloadRequest
          };
          _ajaxTemplate(
            payload,
            function (res) {
              if (res.cart && res.cart.error) {
                return reject({ status: 'F', message: res.cart.error });
              }
              resolve(res);
            },
            function (err) {
              console.log('error ajax', err);
              return reject({ status: 'F', message: 'Something went wrong' });
            }
          );
        }
        if (eventType === 'CHOOSE_OTHER_PAYMODE') {
          console.log('event: CHOOSE_OTHER_PAYMODE is called in deferred handler', { data, cart_items });

          const payloadRequest = {
            action: 'removepaymentintent'
          };
          const payload = {
            method: 'POST',
            targetURL: 'http://localhost:3000/v5/cart/' + cartId + '?payment_info=1',
            requestPayload: payloadRequest
          };
          _ajaxTemplate(
            payload,
            function (res) {
              if (res.cart && res.cart.error) {
                return reject({ status: 'F', message: res.cart.error });
              }
              delete merchantConfig.promo;
              resolve(res);
            },
            function (err) {
              console.log('error ajax', err);
              return reject({ status: 'F', message: 'Something went wrong' });
            }
          );
        }
        if (eventType === 'FETCH_PCF_DETAILS') {
          payload = {
            method: 'POST',
            targetURL: 'http://localhost:3000/cart/deferredFetchPcf',
            requestPayload: data
          };
          _ajaxTemplate(
            payload,
            function (res) {
              return resolve(res);
            },
            function (err) {
              return reject({ status: 'F', message: err.error });
            }
          );
        }
      });
    }
}

// helper functions
function _ajaxTemplate(data, successCallback, errorCallback) {
  var xhr = new window.XMLHttpRequest();
  xhr.addEventListener('readystatechange', function () {
    if (this.readyState === 4) {
      if (!this.status) {
        data = {
          head: {},
          body: {
            resultInfo: {
              resultStatus: 'F',
              resultCode: '0000',
              resultMsg: 'Something went wrong'
            }
          }
        };
        errorCallback(data.body);
      }
      if (this.status >= 200 && this.status < 400) {
        data = JSON.parse(this.responseText);
        if (data && data.body) {
          successCallback(data.body);
        }
        successCallback(data);
      } else if (this.status >= 400) {
        errorCallback(JSON.parse(this.responseText));
      }
    }
  });

  xhr.open(data.method, data.targetURL);
  xhr.setRequestHeader('sso_token', merchantConfig.token);
  xhr.setRequestHeader('x-user-id', integrationConfig.userId);
  if (data.requestPayload) {
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(data.requestPayload));
  } else {
    xhr.send();
  }
}

export { merchantConfig, integrationConfig, merchantHandlers };