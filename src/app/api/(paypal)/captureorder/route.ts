import client from '@/lib/paypal';
import paypal from '@paypal/checkout-server-sdk'
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const requestBody = await request.json();

    if(!requestBody || !requestBody.order_price || !requestBody.user_id) {
        return NextResponse.json({error: "Missing parameters!"});
    }

    const { orderID } = requestBody;
    const PaypalClient = client()
    const Request = new paypal.orders.OrdersCaptureRequest(orderID)
    Request.requestBody({
        payment_source: {} // Add the required 'payment_source' property here
    });
    const response = await PaypalClient.execute(Request)
    if (!response) {
        return NextResponse.json({error: "Some Error Occured at backend"});
      }

      // Your Custom Code to Update Order Status
  // And Other stuff that is related to that order, like wallet
  // Here I am updateing the wallet and sending it back to frontend to update it on frontend
  return NextResponse.json({success: true, data: {}});
}
  