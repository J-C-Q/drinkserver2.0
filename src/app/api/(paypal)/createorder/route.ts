import client from '@/lib/paypal';
import paypal from '@paypal/checkout-server-sdk'
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const requestBody = await request.json();

    if(!requestBody || !requestBody.order_price || !requestBody.user_id) {
        return NextResponse.json({error: "Missing parameters!"});
    }

    try {
        const PaypalClient = client()
        const Request = new paypal.orders.OrdersCreateRequest()
        Request.headers['Prefer'] = 'return=representation'
        Request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [
              {
                amount: {
                  currency_code: 'EUR',
                  value: requestBody.order_price+"",
                },
              },
            ],
          })
          const response = await PaypalClient.execute(Request)
          if (response.statusCode !== 201) {
            console.log("RES: ", response)
            return NextResponse.json({error: "Some Error Occured at backend"})
          }
          

          // Your Custom Code for doing something with order
          // Usually Store an order in the database like MongoDB
      
            const order = {
                id: response.result.id,
                status: response.result.status,
                links: response.result.links,
            }
          return NextResponse.json({success: true, data: {order}})
    } catch (error) {
        console.log("ERROR: ", error)
        return NextResponse.json({error: "Could Not Find the user"})
    }
  }
  