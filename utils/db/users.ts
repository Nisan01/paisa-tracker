import { getDb } from "@/index";
import { users } from "./schema";
import { eq } from "drizzle-orm";


export const getUserByEmail=async(email:string)=>{  

    const db = getDb();

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return user;

}



export const createUser=async(userData:{
    email:string;
    name:string;


})=>{

    const db=getDb();

    const [newUser] = await db.insert(users).values(userData).returning();
    return newUser; 



}