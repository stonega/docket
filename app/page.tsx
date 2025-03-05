import Link from "next/link";
import Header from "./header";
import Image from "next/image";
import { fraunces } from "./fonts";
import ChromeLogo from "@/components/chrome-logo";
import classnames from "classnames";
import Logo from "@/components/logo";
import { Footer } from "./footer";

export default function Page() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <Header />
      <div className="mt-[6px] grow grid grid-cols-1 lg:grid-cols-2 text-black">
        <div className="py-4 bg-[#ff90ee] flex flex-col items-center justify-center">
          <span
            className={classnames("uppercase text-[80px] md:text-[100px] font-bold border-y border-black text-center leading-[80px] md:leading-[100px]", fraunces.className)}
          >
            Docket
          </span>
          <span
            className="text-2xl md:text-2xl mt-16 mx-4 md:mx-28 text-center tracking-wide leading-relaxed"
          >
            Docket can assist you in{" "}
            <span className="highlight-text leading-relaxed">
              highlighting and saving text, code, and images while you read
              documents on the web
            </span>
            , especially for programming documents. It{" "}
            <span className="highlight-text leading-relaxed">
              automatically recognizes the URL of the document site and organizes
              the excerpts for you.
            </span>
          </span>
          <Link
            href="/home/"
            className="rounded-md mt-6 border flex font-bold flex-row items-center py-2 px-4 border-black bg-yellow-100 hover:border-yellow-100"
          >
            <Logo className="w-6 h-6 mr-4 text-black"></Logo>
            Enter My Docket
          </Link>
        </div>
        <div className="bg-[#ffc900] py-2 flex flex-col items-center justify-center">
          <div className="flex px-6 lg:flex-row flex-col mt-4 space-y-4 lg:space-y-0 space-x-0 lg:space-x-4">
            <div className="text-xl p-4 rounded-md w-full max-w-full md:max-w-60 bg-[#e5c2ff] border border-black">
              Select the text, right-click and choose{' '}
              <span className="text-orange-700 font-bold">
                Highlight and save to Docket
              </span>
            </div>
            <div className="text-xl p-4 rounded-md w-full max-w-full md:max-w-60 bg-[#a9effe] border border-black">
              Right click on image and select{' '}
              <span className="text-green-600 font-bold">
                Save image to Docket
              </span>
            </div>
            <div className="text-xl p-4 rounded-md w-full max-w-full md:max-w-60 bg-[#ffd674] border border-black">
              Save code by click little{' '}
              <Image
                alt="Docket"
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQIAAAECCAYAAAAVT9lQAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAzGSURBVHgB7d0/cFTXFcfx38pmqILl1i4kdUCDKHArEdk1Ij2W3Jo4iM6hQWqMO8QY0lrCfVDqxCBaXCBmMkAqRGG3KE4TnInX7+zqiT/6t7vvvn3n3vv9zGj0J3hSvd+ee+6597XUo/ZDjeqIZtXSVPHrZPF9vPg+KgBebKmtzeL7RvH9vv6ntdbp4m89aB32D4oAGC8CYEEjmhMPPhCXtlb0i5aKQNg86J/tGwSdCuCorhY/LghA7JZbJ3V5v/9xzyDoVAFHda/4cVwAUrGplzq7V3Uw8vYf2v8s1v+EAJCizgd85xl/yxsVAZUAkIVdlcFOEGz3BB6KEAByYGFwutxVeLU06DYGxwUgB+Pbz3xHpyLYXhI8E4C8vNSELRG6FcERLQpAfo50xwNa272BFwKQn3bRI/hFEyOdsWEAeWp1jw7Y0mBaAPL1jqZGin2DUwKQr7YmrSIYF4B8tTVuQcCJQiBnRZ9gRACyRxAAIAgAEAQARBAAEEEAQAQBABEEAEQQABBBAEAEAQARBABEEAAQQQCg8K4aMvGJghn/cP+/jf7uta9jr/5u38c+EA6x9bP02RVp7a4wBO3HakSr+D9uqwGtk3LBAsG+LCgmj7/6/dTx7t/QtXhTWvqLUDOCwKFOOJzoBsT0mVcBkSvCoH4EQSTKcLBgmP4ov8ph7fvuUmHrP0INCIKIWSCUwTB1RsnbeCKdnScM6kAQJMKWDxYKszPSuRkla/PHIgzmiu8/CQERBAmyJYMFwvz5NCsFwiA8giBxZaVw9eLe252xIgzCIggyYr2E+VlpLpGXzREG4RAEGbLKYPFiGoFAAzGMpoKAEeMG2Sfp/JXulOXqmqJmW6r3VhjCihVB4EAqgWBhcP1LIUIEgSMpBILtkFz9XIgMPQLHrIdg5XaMuwyXr0nL3wl9okeAXaxCsOrARnrt55hc/3N3uxRxIAgisLLW7cjHtly4801RzXDUOwoEQSTK/kFM1YHd/2BhwE6CfwRBZMrqwE4BxsB2EmyaEr4RBBGyiuD8F9LSLUVh4dPi64LgGLsGkbNLUzprcec7C3bl2ek/MIZ8GHYNMJCNp92lgn33rOwXwCeCIAG2VLBP2xu35RqTh34RBAlZ+Np/38D6BcwX+EMQJGbxlv8w+PYrthS9IQgSZGFgI75eWWPTKgP4wa5BwuzyE/v09cr6Gt6bnMPGrgGCs+Ejm0T0isahHwRB4iwMvPYM7Mo2Bo18IAgy4LmBaOPHNA6bRxBkwsLA45yBDRrROGweQZARmzNYfyB3Ll3guHLTCILM2GElb8eYrSqwi0zQHIIgM3bduMdrx+2NUEwcNocgyJBVBEs35Q73FjSHIMiUXSzqrXlYvlUaw0cQZMx2Erz1C6gKmkEQZMz6BN4mD6kKmkEQZG79B39LBKqC4SMI4G6JYFWBXcGG4SEI4HKJMJ/IK+NjQRCgw5YInq5It1fFcwZheAgC7Lj8tZ9BI84gDBdBgB3WJ/DUOLzEEeWhIQjwhuXbvqoCthKHgyDAGywEPFUFbCUOB0GAXTxVBbaVSNOwfgQBdvFWFdA0rB9BgD15qgqm6BPUjiDAnjxVBZw/qB9BgH156xWgPgQB9uWpKphj5LhWBAEOZO9F8MBek8byoD4EAQ5k04Zebj5meVAfggCH8vJyFHYP6kMQ4FB2MtFD05DhovoQBOjJ6h25wD0F9SAI0BMvdxXQJ6gHQYCe2PLguYPrzOgT1IMgQM88bCVyNLkeBAF65mUbkYtNwyMI0DMvy4NzM0JgBAH64qFpSEUQHkGAvngIAusTEAZhEQToy8ZTJ8NFNAyDIgjQFwuBjSdq3KkTQkAEAfr2t7tqHBVBWAQB+uZhG9GOJXPuIByCAH3z0iewMEAYBAEG4qFPwPIgHIIAA3n0VI2jIgiHIMBAbMqwaVOcRAyGIMBAXDQMPxACIQgwEGsWNn3uwCYM2TkIgyDAwDboEySDIMDANh2cROTMQRgEAQZGRZAOggAD8xAEYwRBEAQBBsbSIB0EAQbmYueAXYMgCAJU8qLhMwf0CMIgCFAJo8ZpIAhQiYc+AcuD6ggCVOIhCKgIqiMIUImHewmoCKojCFAJFUEaCAJUQkWQBoIAlXioCN47JlREEKAyD1UBqiEIUNm/f1ajJugRVEYQACAIUN2zhvsEY1xZVhlBAIAgQHXPfxIiRxAgeswRVEcQIHqjzBFURhAAIAhQ3VbDcwSojiBAZUwWxo8gAEAQACAIAIggQADs48ePIEBl7OPHjyAAQBAAIAgQQNM9Ag/XpcWOIEBl79EsjB5BAIAgQHVN7xpwH0J1BAEqe5+lQfQIAlQ21vAtwpx+rI4gQPRecPqxMoIAlXh47+Bztg8rIwhQyThXiSeBIED0GCiqjiBAJR6WBptsH1ZGEKASD0GA6ggCVDJ5XI1jaVAdQYBKPJwzIAiqIwhQyeQJNYoQCIMgwMDs+HHTR5A5ZxAGQYCBeWgUMl4cBkGAgXkIgo2nQgAEAQbGjkE6CAIMzEUQ0CMIgiDAwJo+fmw2nggBEAQYiO0WNF0RWKOQF7CGQRBgIB6WBY/+JQRCEGAg0x+pcSwLwiEIMJCpM2ocOwbhEAQYSNOjxWaDpUEwBAH6Zv0BD29AZmkQDkGAvrnoDzxlxyAkggB9m3bQH+DC0rAIAvRtykFFsP5ACIggQF+sGnDRH6BRGBRBgL7MzsgFKoKwCAL0xcOy4P4PQmAEAXpmLzPxMFpMNRAeQYCezX4sF9apCIIjCNCzc7+XC1QE4REE6IktCzwMEtEfqAdBgJ7Mn5cLa/8QakAQoCdzs3KB/kA9CAIcyoaIXLzs9EduLa4LQYBDzVMNJI8gwIGsSTjnpD+wuibUhCDAgTzsFBhbFrBtWB+CAAe6elEusCyoF0GAfVlvwEOT0LAsqBdBgH15qQZYFtSPIMCePFUDLAvq12o/VlsNaJ0UHHv2dz9BMPFJPleXF89jI6gIsIunasAGiHh/Qf0IAuzipTdgbtwWhoAgwBs8VQP2ktO174UhIAiwwy4l9VQNrN3l3QXDQhBgx6ULfqoBs3RLGBKCAB12pmDxj3LDLiChSTg8BAE6vv1KrizTJBwqggCdBqGXw0XGKgGahMNFEGTOlgSeGoSG3sDwEQSZsyWBpwahVQMrHDAaOoIgY1c/97UkMFQDzeCsQabsjUUP/ypXrBqwcwU546wBhsb6Ane+kTtUA80hCDLkrS9g6A00iyDIjMe+gKEaaBZBkBELAU/TgyWbIqQaaBZBkIm5cz5DwMxfERpGEGTAdgiWnT5sVglwpqB5BEHiLATurXaPGHtjAUBvwAeCIGGeQ8BYCFAN+EAQJMp7CNhdhDQI/SAIEuQ9BMz5LwRHCILE2O6AjQ57DgGWBP4QBAmxOYGVa3LNAmCRBqE77wpJuP6ltPCpXLOLSM/OCw4RBJErDxBNnpB7SzdZEnjF0iBi02e6TcEYQsB2CJa/E5wiCCJl/QALAW+nCPdiVcBl572L3LE0iIwtBewYsccThHsp+wK8qMQ3KoKILFwotgbvxBMChr5AHKgIIhBbFVCyeQH6AnEgCByzoSB7DZnX48MHsfcSMC8QD4LAKXvpiL1vIIZm4NtsKfAZdwxEhSBwxrYELQBiWwaULARoDsaHIHAi9gAw5Q4BzcH4EAQNSyEATCcE5giBWBEEDbAm4OyMNOfs5aNV2LFiu2MAcSIIhqjcBViY831MuF/WGFx/IESMIKhZip/+r7MQ4Kah+BEENbCH324Jsod/9uO0Pv1L1hOw8wOEQBoIgkDKT/5zM91P/hQf/lLZGKQnkA6CYEDlp749/KeOp1n278V2BWgMpocg6JHN+9vDbg9/Tg/+68phIbYI00MQvMU+6W2s1x54+xr7MP1SvxcbT4pK4E+EQKqyDAL7dB891n3Q7bv9Prb98Mc421+31aIhuHCNseGUtdqP1RaArHExCQCCAABBAEAEAQARBABEEAAQQQBABAEAEQQARBAAEEEAQAQBABEEAEQQAFA3CLYEIF9tbVkQbApAvlratCB4JAD5amljRL9qXQDy9X/db7UfalRH9az4dVQA8vNS74+0ThfNwl+1KgD5aWnFMqBlP7efaLzoHD4TgLy0NNE60W0Wyn4oqoIbApCP4pnvPPuyPNi23St4WPw4LgCp22yd1ET5y85kYadX0NJZMVcApG5z+1nf8caI8fYS4bwIA0CJ6jzj5ZKg1NrrX243D++JZQKQkk4l8HYImD0PHXX+4UudpoEIJMKe5eKZ3isETOuw/367OlgsfpwTgJh0Z4Te0fJ+AVA6NAhKnV2FI5otaojpIhgmi/9yTEwjAp5sFc/mczs7UHyt679a62wC9OA3GftJMjR7R84AAAAASUVORK5CYII="
                width={24}
                height={24}
                className="inline"
              />{' '}
              inside code block
            </div>
          </div>
          <span className="text-2xl md:text-2xl mt-16 mx-10 md:mx-28 text-center tracking-wide leading-relaxed text-black">Use Chrome extension to save Highlight from web.</span>
          <div className="flex flex-row space-x-4 mt-6">
            <a
              href="https://chromewebstore.google.com/detail/docket-highlighter/pbnonpcfnmdbfmabpjfllgljbfkccjco"
              target="_blank"
              className="border font-bold rounded-md flex flex-row items-center px-4 py-2 border-black  hover:border-yellow-100 bg-yellow-100"
            >
              <ChromeLogo className="w-6 h-6 mr-4"></ChromeLogo>Download Extension</a>
          </div>
        </div>
      </div>
      <Footer />
    </main >
  );
}
