import { type SyntheticEvent, useEffect, useState, useRef } from "react";
import googleLogo from "../assets/google-logo.svg";
import "../App.css";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch } from "../store";
import { setUser } from "../reducers/userReducer";
import { saveUser } from "../db";

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

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [googleStatus, setGoogleStatus] = useState(() =>
    googleClientId
      ? "Ready to sync with Google"
      : "Add VITE_GOOGLE_CLIENT_ID to .env",
  );

  const nameInputRef = useRef<HTMLInputElement>(null);
  const usernameInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!googleClientId) {
      return;
    }

    const initializeGoogle = () => {
      window.google?.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response) => {
          setGoogleStatus(`Google token received (${response.select_by})`);
          console.log("Google ID token:", response.credential);
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
    script.onerror = () => setGoogleStatus("Could not load Google sign-in");
    document.head.appendChild(script);
  }, []);

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

  const createSyncAccount = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    // Focus username first if empty
    if (!trimmedUsername) {
      usernameInputRef.current?.focus();
      return;
    }

    // Then focus password if empty
    if (!trimmedPassword) {
      passwordInputRef.current?.focus();
      return;
    }

    // Optional minimum length check
    if (trimmedPassword.length < 8) {
      passwordInputRef.current?.focus();
      passwordInputRef.current?.select();
      return;
    }

    const user = {
      name: trimmedUsername,
      username: trimmedUsername,
      authMode: "account" as const,
    };

    dispatch(setUser(user));
    await saveUser(user);

    navigate("/project");
  };

  const signInWithGoogle = () => {
    if (!googleClientId) {
      setGoogleStatus("Missing Google client ID");
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
                src="assets/nagare-logo.png"
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
                onChange={(event) => {
                  setName(event.target.value);
                }}
                placeholder="Sankarsana"
                autoComplete="given-name"
              />
              <button type="submit">Continue locally</button>
            </form>
          </div>

          <div>
            <div className="divider lg:mt-0">
              <span>or sign in only if you want sync.</span>
            </div>

            <form className="signup-form" onSubmit={createSyncAccount}>
              <label htmlFor="username">
                Username (only letters and numbers)
              </label>
              <input
                ref={usernameInputRef}
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value);
                }}
                placeholder="sankarsana3012"
                autoComplete="username"
              />
              <label htmlFor="password">Password (at least 8 characters)</label>
              <input
                ref={passwordInputRef}
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                }}
                placeholder="Enter a secure password"
              />
              <button type="submit">Create sync account</button>
            </form>

            <button
              type="button"
              className="google-button"
              onClick={signInWithGoogle}
            >
              <img src={googleLogo} alt="" width="20" height="20" />
              <span>Continue with Google</span>
            </button>
            <p className="auth-status">{googleStatus}</p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Signup;
