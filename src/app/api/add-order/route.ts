import { auth } from "@/auth";
import { NextResponse } from 'next/server';
import {Order} from "@/actions/order";
 
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userid = searchParams.get('userId');
  const itemid = searchParams.get('itemId');
 
  const session = await auth();

  if (!session) {
    return NextResponse.json({error: "Not logged in!"});
  }

  if(session.user.id !== userid) {
    return NextResponse.json({error: "Not logged in!"});
  }

  if(!itemid || !userid) {
    return NextResponse.json({error: "Missing parameters!"});
  }

    const result = await Order(itemid,userid);

  return NextResponse.json(result);
    // const result = await Order(itemid,userid);
}
