import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Groq from "groq-sdk";
import { analysisBodySchema } from "@/app/api/dashboard/_schemas";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = analysisBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid payload", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { categories } = parsed.data;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Analyze these expense categories and provide brief insights:\n${JSON.stringify(
            categories
          )}`,
        },
      ],
      model: "openai/gpt-oss-20b",
    });

    const analysis = chatCompletion.choices[0]?.message?.content || "";

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
