"use client";
import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "@radix-ui/react-icons";

const ThemeModeButton = () => {
  const [mode, setMode] = useState("");
  useEffect(() => {
    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
      setMode("dark");
    } else {
      document.documentElement.classList.remove("dark");
      setMode("light");
    }
  }, []);
  const toggleTheme = () => {
    if (mode === "dark") {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
      setMode("light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
      setMode("dark");
    }
  };

  return (
    <>
      <button
        id="theme-toggle"
        type="button"
        onClick={toggleTheme}
        className="flex flex-row items-center text-sm text-black focus:outline-none dark:text-white"
      >
        {mode === "light" ? <SunIcon /> : <MoonIcon />}
      </button>
    </>
  );
};

export default ThemeModeButton;
