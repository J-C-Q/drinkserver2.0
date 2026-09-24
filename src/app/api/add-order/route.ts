import { NextResponse } from 'next/server';
import {order} from "@/actions/order";
import { currentUser } from "@/lib/auth-guard";
 
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userid = searchParams.get('userId');
  const itemid = searchParams.get('itemId');
 
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({error: "Not logged in!", code: 401});
  }

  // userId is optional and only kept for existing clients; the order is
  // always placed for the session user.
  if(userid && user.id !== userid) {
    return NextResponse.json({error: "Not logged in as this user!", code: 401});
  }

  if(!itemid) {
    return NextResponse.json({error: "Missing parameters!", code: 400});
  }

    const result = await order(itemid);

  return NextResponse.json({data: result, code: 200});

}
