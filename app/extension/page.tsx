"use client";
import { useAuth, useClerk, useUser } from "@clerk/nextjs";
import { useAsyncEffect } from "ahooks";
import { useSearchParams } from "next/navigation";
import { Suspense } from 'react'

function Extension() {
  const { getToken } = useAuth();
  const { publishableKey } = useClerk();
  const params = useSearchParams();
  const { isLoaded, user } = useUser();
  const docketExtensionId = publishableKey.startsWith("pk_test")
    ? "ijbccfkkejndajdiognflbmbbebboaeh"
    : "pbnonpcfnmdbfmabpjfllgljbfkccjco";

  useAsyncEffect(async () => {
    if (!isLoaded) return;
    const token = await getToken({ template: "Extension" });
    chrome.runtime.sendMessage(docketExtensionId, {
      method: "login",
      data: {
        token,
        tabId: params.get("tabId"),
        user: {
          id: user?.id,
          fullName: user?.fullName,
          email: user?.emailAddresses[0].emailAddress,
          imageUrl: user?.imageUrl,
        },
      },
    });
  }, [isLoaded]);
  return (
    <div className="h-screen flex flex-col items-center justify-center space-y-2">
      <span className="text-2xl">Account Connected</span>
      <span
        className="text-xl underline cursor-pointer"
        onClick={() => window.close()}
      >
        Close
      </span>
    </div>
  );
};
export default function ExtensionPage() {
  return (
    <Suspense>
      <Extension />
    </Suspense>
  )
}
