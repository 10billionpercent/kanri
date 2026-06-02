import { type SyntheticEvent, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch } from "../store";
import { setUser } from "../reducers/userReducer";
import { register, login } from "../services/api";
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

  const setErrorWithTimeout = (errorMessage: string) => {
    setError(errorMessage);
    setTimeout(() => setError(""), 5000);
  };

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
    // No IndexedDB save – just go to project page
    navigate("/project");
  };

  const handleSyncAccount = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorWithTimeout("");
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
      setErrorWithTimeout("Password must be at least 8 characters");
      passwordInputRef.current?.focus();
      return;
    }

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
      // No sync – just navigate; ProjectPage will load data from API
      navigate("/project");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Authentication failed";
      setErrorWithTimeout(message);
    }
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
                onChange={(e) => setName(e.target.value)}
                placeholder="Sankarsana"
                autoComplete="given-name"
              />
              <button type="submit">Continue locally</button>
            </form>
          </div>

          <div>
            <div className="divider lg:mt-0">
              <span>Or sign up only if you want sync.</span>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form className="signup-form" onSubmit={handleSyncAccount}>
              <label htmlFor="username">Username</label>
              <input
                ref={usernameInputRef}
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
              <button type="submit">
                {isLogin ? "Log in" : "Create account"}
              </button>
            </form>

            <div className="text-center mt-4 text-sm">
              {isLogin ? (
                <p className="switch-link">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className="switch-link-button"
                  >
                    Sign up
                  </button>
                </p>
              ) : (
                <p className="switch-link">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className="switch-link-button"
                  >
                    Log in
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Signup;
