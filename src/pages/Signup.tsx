import { type SyntheticEvent, useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch } from "../store";
import { setUser } from "../reducers/userReducer";
import { saveUser } from "../services/db";
import { register, login } from "../services/api";
import { syncAfterLogin } from "../syncThunks";
import googleLogo from "../assets/google-logo.svg";
import "../App.css";

type GoogleCredentialResponse = {
  credential: string;
  select_by: string;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() ?? "";

function Signup() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const nameInputRef = useRef<HTMLInputElement>(null);
  const usernameInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Google Sign-In effect
  useEffect(() => {
    if (!googleClientId) return;

    const initializeGoogle = () => {
      window.google?.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          const tokenPayload = response.credential.split(".")[1];
          const decodedData = JSON.parse(
            atob(tokenPayload.replace(/-/g, "+").replace(/_/g, "/")),
          );

          // For Google, we treat as cloud account – you'd need backend Google auth
          // For now, store locally (extend later to call your backend)
          const user = {
            name: decodedData.name || "Google User",
            username: decodedData.email,
            authMode: "account" as const,
          };
          dispatch(setUser(user));
          await saveUser(user);
          navigate("/project");
        },
      });
    };

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]',
    );

    if (existingScript) {
      initializeGoogle();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    script.onerror = () =>
      console.error("Could not load Google sign-in script");
    document.head.appendChild(script);
  }, [dispatch, navigate]);

  const continueLocally = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      nameInputRef.current?.focus();
      return;
    }

    const user = {
      name: trimmedName,
      authMode: "local" as const,
    };

    dispatch(setUser(user));
    await saveUser(user);
    navigate("/project");
  };

  const handleSyncAccount = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername) {
      usernameInputRef.current?.focus();
      return;
    }
    if (!trimmedPassword) {
      passwordInputRef.current?.focus();
      return;
    }
    if (!isLogin && trimmedPassword.length < 8) {
      setError("Password must be at least 8 characters");
      passwordInputRef.current?.focus();
      return;
    }

    console.log("Submitting", { isLogin, trimmedUsername, trimmedPassword });
    try {
      let authResponse;
      if (isLogin) {
        authResponse = await login(trimmedUsername, trimmedPassword);
      } else {
        authResponse = await register(
          trimmedUsername,
          trimmedPassword,
          trimmedUsername,
        );
      }

      const userState = {
        name: authResponse.user.display_name || authResponse.user.username,
        username: authResponse.user.username,
        authMode: "account" as const,
      };

      dispatch(setUser(userState));
      await saveUser(userState);

      // Sync cloud data to local IndexedDB and Redux
      await dispatch(syncAfterLogin()).unwrap();

      navigate("/project");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Authentication failed";
      setError(message);
      console.error("Sync account error:", err);
    }
  };

  const signInWithGoogle = () => {
    if (!googleClientId) {
      console.error("Missing Google client ID");
      return;
    }
    window.google?.accounts.id.prompt();
  };

  return (
    <main className="signup-shell min-h-svh grid place-items-center p-4 sm:p-6">
      <section
        className="signup-panel w-full max-w-6xl"
        aria-labelledby="signup-title"
      >
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-0 xl:gap-12 p-6 sm:p-8">
          <div>
            <div className="brand-row">
              <img
                src="/nagare-logo.png"
                width="80"
                height="80"
                alt="nagare logo"
              />
            </div>
            <h1>Nagare</h1>
            <p className="tagline">
              More than a to-do list. Made for real workflow.
            </p>
            <p className="signup-copy">Start instantly.</p>
            <form className="signup-form" onSubmit={continueLocally}>
              <label htmlFor="name">What should we call you?</label>
              <input
                ref={nameInputRef}
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Sankarsana"
                autoComplete="given-name"
              />
              <button type="submit">Continue locally</button>
            </form>
          </div>

          <div>
            <div className="divider lg:mt-0">
              <span>{isLogin ? "Login to sync" : "Create sync account"}</span>
            </div>

            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-1 rounded ${!isLogin ? "bg-purple-600 text-white" : "bg-gray-200"}`}
              >
                Sign up
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-1 rounded ${isLogin ? "bg-purple-600 text-white" : "bg-gray-200"}`}
              >
                Login
              </button>
            </div>

            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}

            <form className="signup-form" onSubmit={handleSyncAccount}>
              <label htmlFor="username">Username</label>
              <input
                ref={usernameInputRef}
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="sankarsana3012"
                autoComplete="username"
              />
              <label htmlFor="password">
                Password {!isLogin && "(at least 8 characters)"}
              </label>
              <input
                ref={passwordInputRef}
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
              />
              <button type="submit">
                {isLogin ? "Login" : "Create account"}
              </button>
            </form>

            <button
              type="button"
              className="google-button"
              onClick={signInWithGoogle}
            >
              <img src={googleLogo} alt="" width="20" height="20" />
              <span>Continue with Google</span>
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Signup;
