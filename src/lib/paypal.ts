import checkoutNodeJssdk from '@paypal/checkout-server-sdk'

const configureEnvironment = function () {
    const clientId = process.env.PAYPAL_CLIENT_ID
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET
  
    if(!clientId) {
        throw new Error('Missing PAYPAL_CLIENT_ID')
        }
    if(!clientSecret) {
        throw new Error('Missing PAYPAL_CLIENT_SECRET')
        }
    return process.env.NODE_ENV === 'production'
      ? new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret)
      : new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret)
  }
  
  const client = function () {
    return new checkoutNodeJssdk.core.PayPalHttpClient(configureEnvironment())
  }

  export default client;