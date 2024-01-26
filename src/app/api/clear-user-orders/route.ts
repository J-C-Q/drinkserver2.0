import { auth } from "@/auth";
import { NextResponse } from 'next/server';

import {verifyPendingOrdersForUser} from "@/data/order";
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userid = searchParams.get('userId');

 
  const session = await auth();

  if (!session) {
    return NextResponse.json({error: "Not logged in!"});
  }

  if(!userid) {
    return NextResponse.json({error: "Missing parameters!"});
  }

  if(session.user.role !== "ADMIN") {
    return NextResponse.json({error: "You are not authorized to perform this action!"});
  }

  const result = await verifyPendingOrdersForUser(userid);

  return NextResponse.json(result);
}
