import React from "react";
import { FaLaptopCode, FaRocket } from "react-icons/fa";

interface SplitScreenLayoutProps {
  formSide: React.ReactNode;
  isLogin: boolean;
}

export const SplitScreenLayout: React.FC<SplitScreenLayoutProps> = ({
  formSide,
  isLogin,
}) => {
  // Panel styles
  const cyanPanelClass =
    "bg-[hsl(var(--color-accent))] text-black p-8 md:p-16 flex flex-col justify-center items-center shadow-2xl transition-all duration-700 ease-in-out";

  const whitePanelClass =
    "bg-theme-secondary text-theme-primary p-8 md:p-16 flex flex-col justify-center items-center transition-all duration-700 ease-in-out";

  const marketingContent = isLogin
    ? {
        title: "Welcome Back, Coder!",
        icon: <FaLaptopCode className="text-6xl mb-4 text-black" />,
        text: "Please sign in to access your dashboard, manage your problems, or jump into the next contest.",
        cta: "New here? Register now!",
      }
    : {
        title: "Launch Your Journey!",
        icon: <FaRocket className="text-6xl mb-4 text-black" />,
        text: "Join our community! Whether you're here to compete or to organize the next big event, we've got you covered.",
        cta: "Already registered? Sign in!",
      };

  const isFormOnLeft = isLogin;

  const marketingPanel = (
    <div
      className={`w-full md:w-1/2 hidden md:flex ${cyanPanelClass} ${
        isFormOnLeft ? "rounded-r-2xl" : "rounded-l-2xl"
      } relative overflow-hidden`}
    >
      <div className="relative z-10 w-full h-full flex flex-col justify-center items-center text-center">
        {marketingContent.icon}
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-black">
          {marketingContent.title}
        </h2>
        <p className="text-lg md:text-xl leading-relaxed max-w-sm text-black/80">
          {marketingContent.text}
        </p>
        <p className="mt-8 text-base font-medium underline hover:text-black cursor-pointer">
          {marketingContent.cta}
        </p>
      </div>
    </div>
  );

  const formPanel = (
    <div
      className={`w-full md:w-1/2 ${whitePanelClass} ${
        isFormOnLeft ? "md:rounded-l-2xl" : "md:rounded-r-2xl"
      } rounded-2xl md:rounded-none max-w-none`}
    >
      <div className="flex flex-col md:hidden mb-6 text-center text-theme-primary">
        <h2 className="text-3xl font-bold mb-2">{marketingContent.title}</h2>
        <p className="text-lg opacity-90 text-theme-secondary">
          {marketingContent.text}
        </p>
      </div>

      <div
        key={isLogin ? "login" : "register"}
        className="w-full transition-opacity duration-500 ease-in-out animate-fade-in-slide-up"
      >
        {formSide}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-primary p-4">
      <div className="flex flex-col md:flex-row max-w-7xl overflow-hidden rounded-2xl shadow-3xl">
        {isFormOnLeft ? (
          <>
            {formPanel}
            {marketingPanel}
          </>
        ) : (
          <>
            {marketingPanel}
            {formPanel}
          </>
        )}
      </div>
    </div>
  );
};
