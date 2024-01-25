
export const paypalCreateOrder = async (userid: string,order_price: string) => {
        try {
            let response = await fetch('/api/createorder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: userid,
                    order_price: order_price
                })
            });
            let data = await response.json();
            return data.order_id;
        } catch (err) {
            console.log(err);
            // Your custom code to show an error like showing a toast:
            // toast.error('Some Error Occured')
            return null;
        }
    }
