import contextManager from "@/app/lib/contextManager";
import { NextRequest, NextResponse } from "next/server";
import ollama, { ChatResponse, GenerateResponse, Message } from "ollama";

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";

  let generateResponse: GenerateResponse;

  if (contentType.includes("multipart/form-data")) {
    try {
      const formData = await request.formData();
      const message = formData.get("message") as string;
      const image = formData.get("image") as File;

      let images: Uint8Array[] = [];

      if (image) {
        const arrayBuffer = await image.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        images.push(uint8Array);
      }

      generateResponse = await ollama.generate({
        model: "llava-llama3",
        prompt: message,
        images,
        context: contextManager.getContext(),
      });
    } catch (error) {
      console.error("Error handling form data:", error);
      return NextResponse.json(
        { error: "Error handling form data" },
        { status: 500 }
      );
    }
  } else {
    try {
      const { message } = await request.json();

      generateResponse = await ollama.generate({
        model: "llava-llama3",
        prompt: message,
        context: contextManager.getContext(),
      });
    } catch (error) {
      console.error("Error parsing request body:", error);
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }
  }

  const generatedText = generateResponse.response;
  contextManager.setContext(generateResponse.context);

  return NextResponse.json({ response: generatedText });
}

export const config = {
  runtime: "edge",
};
