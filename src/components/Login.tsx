import React, { useState } from "react";
import butterLoginBg from "../assets/butter-login.jpeg";
import butterLogo from "../assets/butter-logo.png";
import DragBar from "./DragBar";

const Login: React.FC<{ onLogin: (username: string) => void }> = ({ onLogin }) => {
  const [nick, setNick] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nick.trim()) {
      setError("Ingresa tu nick");
      return;
    }
    setError("");
    onLogin(nick.trim());
  };

  return (
    <div
      className="w-full h-full min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: `url(${butterLoginBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        flexDirection: "column"
      }}
    >
      <div className="fixed top-0 left-0 w-full z-50">
        <DragBar />
      </div>
      <form onSubmit={handleSubmit} className="bg-[#181c24e6] rounded-2xl shadow-2xl p-10 flex flex-col items-center w-[350px] max-w-full relative">
        <img src={butterLogo} alt="Butter Logo" className="h-16 mb-6 drop-shadow-lg select-none" draggable={false} />
        <input
          type="text"
          placeholder="Your nickname"
          value={nick}
          onChange={e => setNick(e.target.value)}
          className="mb-4 px-4 py-2 rounded-lg w-full bg-[#23293a] text-white text-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
          autoFocus
        />
        {error && <div className="text-red-400 text-xs mb-2">{error}</div>}
        <button
          type="submit"
          className="bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] text-white text-lg font-bold px-8 py-2 rounded-lg shadow-lg hover:scale-105 transition w-full flex items-center justify-center gap-2 mb-4"
        >
          ENTER
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
        <div className="text-sm text-gray-200 text-center mb-6">
          Enter your nickname to continue.
        </div>
        <div className="text-xs text-gray-400 font-mono opacity-80">
          release/2026.01.13-b6c7e88
        </div>
      </form>
    </div>
  );
};

export default Login;
