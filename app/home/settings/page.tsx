import { NotionLogoIcon } from "@radix-ui/react-icons";
import { redirect } from "next/navigation";
import queryString from "query-string";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { headers } from "next/headers";

const notionUrl = "https://api.notion.com/v1/oauth/authorize";
export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const forwardedProtocol = requestHeaders.get("x-forwarded-proto");
  const protocol = forwardedProtocol ?? (host.startsWith("localhost") ? "http" : "https");
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? `${protocol}://${host}`).replace(/\/$/, "");
  const redirectUrl = `${appUrl}/home/settings`;
  const searchQuery = queryString.stringify({
    response_type: "code",
    client_id: process.env.NEXT_PUBLIC_NOTION_CLIENT_ID,
    owner: "user",
    redirect_uri: redirectUrl,
  });
  const code = (await searchParams)["code"];
  const user = await currentUser();
  if (code) {
    const body = JSON.stringify({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUrl,
    });
    const clientId = process.env.NEXT_PUBLIC_NOTION_CLIENT_ID;
    const clientSecret = process.env.NOTION_SECRET;
    if (!clientId || !clientSecret || !user) {
      throw new Error("Notion OAuth is not configured");
    }

    const encoded = Buffer.from(`${clientId}:${clientSecret}`).toString(
      "base64"
    );
    const response = await fetch("https://api.notion.com/v1/oauth/token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Basic ${encoded}`,
      },
      body,
    });
    if (!response.ok) {
      throw new Error(`Notion OAuth failed with status ${response.status}`);
    }
    const result = await response.json();
    await (await clerkClient()).users.updateUser(user.id, {
      unsafeMetadata: { notion: result },
    });

    redirect("/home/settings");
  }

  return (
    <div className="my-10 px-4 container mx-auto flex flex-col h-full space-y-6 dark:text-white">
      <h1 className="font-bold text-2xl">Connect to sync service</h1>
      <div className="flex flex-row items-center space-x-2">
        <NotionLogoIcon className="w-5 h-5" />
        <p className="text-xl">Notion</p>
        {user?.unsafeMetadata.notion ? (
          <div className="text-green-600">Connected</div>
        ) : (
          <a
            className="text-yellow-700 ml-8 dark:text-yellow-400"
            href={`${notionUrl}?${searchQuery}`}
          >
            Setup
          </a>
        )}
      </div>
    </div>
  );
}
