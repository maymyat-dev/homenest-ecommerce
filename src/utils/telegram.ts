import axios from "axios";

interface TelegramResponse {
  ok: boolean;
  result?: unknown;
  description?: string;
}

export const sendTelegramMessage = async (message: string) => {
  const url = `https://api.telegram.org/bot7367395966:AAEegJfOoPXWv1_yYiAN6pAxTyvicB7pK8s/sendMessage`;
  const body = {
    chat_id: "-1003612079939",
    text: `\`\`\`json\n${message}\n\`\`\``,
    parse_mode: "MarkdownV2",
  };
  try {
    const response = await axios.post<TelegramResponse>(url, body, {
      headers: { "Content-Type": "application/json" },
    });
    const data = response.data;
    if (!data.ok) {
      console.error("Failed to send message", data);
    }
  } catch (error: unknown) {
    console.error("Error sending message", error);
  }
};
