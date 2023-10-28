"use client";
import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "@radix-ui/react-icons";

const ThemeModeButton = () => {
  let currentMode = "";
  const [mode, setMode] = useState(currentMode);
  useEffect(() => {
    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
      currentMode = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      currentMode = "light";
    }
    setMode(currentMode);
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
        <span className="ml-2 capitalize">{mode}</span>
      </button>
    </>
  );
};

export default ThemeModeButton;
