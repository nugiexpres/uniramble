import { HeartIcon } from "@heroicons/react/24/solid";
import { SwitchTheme } from "~~/components/SwitchTheme";

// Custom Twitter SVG icon
const TwitterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5 text-blue-400">
    <path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.949.555-2.005.959-3.127 1.184-.897-.959-2.178-1.559-3.594-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124-4.087-.205-7.72-2.165-10.148-5.144-.422.722-.664 1.561-.664 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067 2.189 1.394 4.768 2.209 7.557 2.209 9.054 0 14.002-7.496 14.002-13.986 0-.209 0-.42-.015-.63.961-.689 1.8-1.56 2.46-2.548l-.047-.02z" />
  </svg>
);

// Custom Telegram SVG icon
const TelegramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5 text-blue-400">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.454 8.454l-1.636 7.273c-.121.515-.454.636-.909.394l-2.545-1.909-1.273 1.273c-.121.121-.242.242-.485.242l.606-2.121 4.849-4.849c.242-.242-.061-.363-.363-.121l-5.697 3.697-2.121-.666c-.485-.151-.485-.485.121-.727l8.485-3.333c.363-.121.666.121.545.606z" />
  </svg>
);

/**
 * Site footer
 */
export const Footer = () => {
  return (
    <footer className="bg-purple-700 text-white py-6 px-4 relative z-10 mt-8">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="text-sm text-center md:text-left">
          <p>
            UniRamble © 2025 All rights reserved <span className="mx-2">|</span> Build with{" "}
            <HeartIcon className="inline h-4 w-4 text-red-500" />{" "}
            <a
              href="https://github.com/monad-developers/scaffold-eth-monad"
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 hover:underline"
            >
              @Scaffold-eth-monad
            </a>
          </p>
        </div>
        <div className="flex space-x-4 mt-4 md:mt-0 items-center">
          <TwitterIcon />
          <a
            href="https://twitter.com/nugrosir"
            target="_blank"
            rel="noreferrer"
            className="text-blue-400 hover:underline"
          >
            Twitter
          </a>
          <TelegramIcon />
          <a
            href="https://telegram.com/nugrosir"
            target="_blank"
            rel="noreferrer"
            className="text-blue-400 hover:underline"
          >
            Telegram
          </a>
        </div>
        <div className="absolute top-2 right-4">
          <SwitchTheme className="cursor-pointer" />
        </div>
      </div>
    </footer>
  );
};
