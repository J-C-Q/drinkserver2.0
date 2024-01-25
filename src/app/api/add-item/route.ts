import { auth } from "@/auth";
import { NextResponse } from 'next/server';
import {item} from "@/actions/item";
 
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const itemname = searchParams.get('itemName');
  const itemprice = searchParams.get('itemPrice');
  const quantity = searchParams.get('quantity');
 
  const session = await auth();

  if (!session) {
    return NextResponse.json({error: "Not logged in!"});
  }

  if(session.user.role !== "ADMIN") {
    return NextResponse.json({error: "You are not authorized to perform this action!"});
  }

  if(!itemname || !itemprice || !quantity) {
    return NextResponse.json({error: "Missing parameters!"});
  }

    const result = await item(itemname,parseFloat(itemprice),parseInt(quantity));

  return NextResponse.json(result);
}
