import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/mail/mail";

export async function GET(req) {
  // Example usage
  const success = await sendEmail(
    "omar.sk2004@gmail.com",
    "Proposal Status Update",
    "<p>Your proposal has been <strong>Accepted</strong>.</p>"
  );

  if (success) {
    return NextResponse.json({ message: "Sent" });
  } else {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}