import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
 
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');
  const item = searchParams.get('item');
  try {
    if (!name || !item) throw new Error('Name and item are required');
    await sql`INSERT INTO Orders (Time, Name, Item, Paid) VALUES (${"now"}, ${name}, ${item}, ${false});`;
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
 return NextResponse.json({ message: 'Order added' }, { status: 200 });
//   const orders = await sql`SELECT * FROM Orders;`;
//   return NextResponse.json({ orders }, { status: 200 });
}

// CREATE TABLE Orders ( Time timestamp with time zone, Name varchar(255), Item varchar(255), Paid boolean );

// DROP TABLE orders;