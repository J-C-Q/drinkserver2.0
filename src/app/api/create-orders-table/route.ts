// import { sql } from '@vercel/postgres';
// import { NextResponse } from 'next/server';
 
// export async function GET(request: Request) {
//   try {
//     const result =
//       await sql`CREATE TABLE Orders ( Time timestamp with time zone, Name varchar(255), Item varchar(255), Paid boolean );`;
//     return NextResponse.json({ result }, { status: 200 });
//   } catch (error) {
//     return NextResponse.json({ error }, { status: 500 });
//   }
// }