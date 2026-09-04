import { NextResponse, type NextRequest } from "next/server";

// Telegram sends every update to this route as a POST. Docs:
// https://core.telegram.org/bots/api#update
type TelegramUpdate = {
  message?: {
    chat: { id: number };
    text?: string;
  };
};

async function sendMessage(chatId: number, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!token || !siteUrl) return;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      reply_markup: {
        inline_keyboard: [[{ text: "Open App", web_app: { url: siteUrl } }]],
      },
    }),
  });
}

export async function POST(request: NextRequest) {
  // Telegram echoes this secret on every webhook call (set via setWebhook's
  // secret_token param) so we can confirm a request actually came from
  // Telegram rather than an arbitrary POST to this public URL.
  const secret = request.headers.get("x-telegram-bot-api-secret-token");
  if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const update: TelegramUpdate = await request.json();
  const message = update.message;

  if (message?.text === "/start") {
    await sendMessage(
      message.chat.id,
      "Welcome to the Startup Hub. Tap below to sign in or create your profile.",
    );
  }

  // Telegram expects a fast 200 regardless of what the update was, or it
  // will keep retrying the same update.
  return NextResponse.json({ ok: true });
}
