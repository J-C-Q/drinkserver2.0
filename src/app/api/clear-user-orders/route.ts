import { currentUser } from "@/lib/auth-guard";
import { NextResponse } from 'next/server';

import {verifyPendingOrdersForUser} from "@/data/order";
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userid = searchParams.get('userId');

 
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({error: "Not logged in!", code: 401});
  }

  if(!userid) {
    return NextResponse.json({error: "Missing parameters!", code: 400});
  }

  if(user.role !== "ADMIN") {
    return NextResponse.json({error: "You are not authorized to perform this action!", code: 403});
  }

  const result = await verifyPendingOrdersForUser(userid);

  return NextResponse.json({data: result,code: 200});
}
