"use client";
import { useAuth } from "@clerk/nextjs";
import { useAsyncEffect } from "ahooks";
import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";

const docketExtensionId =
  process.env.NODE_ENV === "production"
    ? "pbnonpcfnmdbfmabpjfllgljbfkccjco"
    : "ijbccfkkejndajdiognflbmbbebboaeh";
const Extension = () => {
  const { getToken } = useAuth();
  const params = useSearchParams();
  const { isLoaded, user } = useUser();
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

export default Extension;
