"use client";
import { useAuth } from "@clerk/nextjs";
import { useAsyncEffect } from "ahooks";
import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";

const docketExtensionId = "fgpdaghgoipbnpokamgcpcpcoeehgjeb";
const Extension = () => {
  const { getToken } = useAuth();
  const params = useSearchParams();
  const { isLoaded, user } = useUser();
  useAsyncEffect(async () => {
    if (!isLoaded) return;
    const token = await getToken({ template: "Extension"});
    console.log(user, token);
    chrome.runtime.sendMessage(
      docketExtensionId,
      {
        method: "login",
        id: params.get("id"),
        data: {
          token,
          user: {
            id: user?.id,
            fullName: user?.fullName,
            email: user?.emailAddresses[0].emailAddress,
            imageUrl: user?.imageUrl,
          },
        },
      },
      function (response) {
        console.log(response);
        if (response.status === "success") {
          window.close();
        } else {
          setTimeout(() => {
            window.close()
          }, 1000);
        }
      }
    );
  }, [isLoaded]);
  return (
    <div className="h-screen flex flex-col items-center justify-center space-y-2">
      <span className="text-2xl">Login successfully</span>
      <span className="text-xl underline cursor-pointer">Close</span>
    </div>
  );
};

export default Extension;
