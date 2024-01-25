"use client";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { paypalCreateOrder } from "@/actions/paypal-create-order";

interface PayButtonProps {}
export const PayButton = ({}: PayButtonProps) => {
  const clientId = "";
  const orderID = "";
  return (
    <PayPalScriptProvider
      options={{
        clientId: "process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID",
        currency: "EUR",
        intent: "capture",
      }}
    >
      <PayPalButtons
        style={{
          color: "gold",
          shape: "rect",
          label: "pay",
          height: 50,
        }}
        createOrder={async (data, actions) => {
          let order_id = await paypalCreateOrder(clientId, orderID);
          return order_id + "";
        }}
        onApprove={async (data, actions) => {
          let response = await paypalCaptureOrder(data.orderID);
          if (response) return true;
        }}
      />
    </PayPalScriptProvider>
  );
};
