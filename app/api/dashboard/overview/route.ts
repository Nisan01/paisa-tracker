import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { overview } from "@/utils/db/overview";

export async function POST(req: Request ) {


    try {

   const session = await getServerSession(authOptions);
   const userId = session?.user?.id;

   if (!userId) {
    return NextResponse.json(
        {message:"Unauthorized"},
        {status:401}
    );
   }

   

    const result=await overview(userId);

    return NextResponse.json((result),{status:200});
        
    } catch (error) {

        return NextResponse.json(
            {message:"Error fetching overview data"},
            {status:500}
        );
        
    }
   


}