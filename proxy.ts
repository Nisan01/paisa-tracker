
import { getToken } from "next-auth/jwt"
import { NextResponse,NextRequest } from "next/server"



export default async  function middleware(request: NextRequest) {

    const token=await getToken({req:request})

    if(!token){

        return NextResponse.redirect(new URL("/signIn",request.url))

    }

    return NextResponse.next()

 


}

export const config =
 { matcher: [] }