import { useUserContext } from "./hooks/userContext";
import Launcher from "./components/Launcher";
import Login from "./components/Login";

export default function App() {
  const { ready, username, setUsername } = useUserContext();

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        className="w-full h-full min-h-screen flex flex-col"
        style={{ position: "relative" }}
      >
        {ready ? (
          username ? (
            <Launcher onLogout={() => setUsername(null)} />
          ) : (
            <Login onLogin={(username) => setUsername(username)} />
          )
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </div>
  );
}
