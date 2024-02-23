import { NextResponse, NextRequest } from "next/server";
import { renderToStaticMarkup } from 'react-dom/server';

import { getToken } from "next-auth/jwt";
import { getServerSession } from "next-auth";
import { db } from "@/app/lib/prisma";
export async function GET(request: NextRequest) {
    const session = await getServerSession();
        const token = await getToken({ req: request });
    if (session) {
        if (token?.role === "Admin") {
        try {
        // Fetch all rows from the contestType table
        const contestTypes = await db.user.findMany();
        // Return the contestTypes as JSON response
        return NextResponse.json(contestTypes);
        } catch (error: any) {
        // Handle errors and return an appropriate response
        return NextResponse.json({ error: error.message }, { status: 500 });
        }}}
  }