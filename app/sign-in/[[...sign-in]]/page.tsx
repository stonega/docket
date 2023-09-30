import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="h-[100vh] grid grid-cols-2 items-center">
      <div></div>
      <div className="flex flex-row justify-center items-center">
        <SignIn />;
      </div>
    </div>
  );
}
