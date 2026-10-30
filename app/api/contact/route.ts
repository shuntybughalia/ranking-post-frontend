import { NextResponse } from "next/server";
import { withApiErrors } from "@/lib/api-handler";
import { addContactMessage, parseContactInput, validateContactInput } from "@/lib/contact";

async function handlePOST(request: Request) {
  const body = (await request.json()) as Record<string, unknown>;

  // Hidden field that only bots fill in: report success so they don't retry.
  if (body.website) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const input = parseContactInput(body);
  const inputError = validateContactInput(input);
  if (inputError) {
    return NextResponse.json({ error: inputError }, { status: 400 });
  }

  const saved = await addContactMessage(input);
  if (!saved) {
    return NextResponse.json(
      { error: "We just received a message from you. Please wait a minute before sending another." },
      { status: 429 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

export const POST = withApiErrors(handlePOST);
