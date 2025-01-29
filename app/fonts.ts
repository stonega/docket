import { Playfair, Fraunces, Geist } from "next/font/google";

export const geist = Geist({ subsets: ["latin"] });
export const fraunces = Fraunces({ subsets: ['latin'] });
export const playfair = Playfair({
  subsets: ["latin"],
  variable: "--custom-font-playfair",
});
