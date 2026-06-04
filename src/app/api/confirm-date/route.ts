import { NextResponse } from "next/server";
import {
  formatDisplayDate,
  isActivity,
  isAllowedDate,
} from "@/lib/date-options";
import { getResend } from "@/lib/resend";

const fixedRecipient = "vladislav.krivonos.work@gmail.com";

type ConfirmDateBody = {
  name?: unknown;
  metadataEmail?: unknown;
  date?: unknown;
  activity?: unknown;
};

function asCleanText(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim().replace(/^['"]|['"]$/g, "") : fallback;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(request: Request) {
  let body: ConfirmDateBody;

  try {
    body = (await request.json()) as ConfirmDateBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = asCleanText(body.name, "beautiful");
  const metadataEmail = asCleanText(body.metadataEmail);
  const date = asCleanText(body.date);
  const activity = asCleanText(body.activity);

  if (!isAllowedDate(date)) {
    return NextResponse.json({ error: "Please choose a date in the next two weeks." }, { status: 400 });
  }

  if (!isActivity(activity)) {
    return NextResponse.json({ error: "Please choose one date activity." }, { status: 400 });
  }

  try {
    const sentAt = new Date().toISOString();
    const displayDate = formatDisplayDate(date);
    const { data, error } = await getResend().emails.send({
      from: "Date Organizer <onboarding@resend.dev>",
      to: fixedRecipient,
      subject: `${name} said yes to a date`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #341320; line-height: 1.6;">
          <h1 style="color: #d81b60;">A date was confirmed</h1>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Invite email from query:</strong> ${escapeHtml(metadataEmail || "Not provided")}</p>
          <p><strong>Date:</strong> ${escapeHtml(displayDate)} (${escapeHtml(date)})</p>
          <p><strong>Activity:</strong> ${escapeHtml(activity)}</p>
          <p><strong>Sent at:</strong> ${escapeHtml(sentAt)}</p>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ id: data?.id });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Could not send confirmation email.",
      },
      { status: 500 },
    );
  }
}
