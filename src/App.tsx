import { type FormEvent, useEffect, useState } from 'react'
import googleLogo from './assets/google-logo.svg'
import './App.css'

type GoogleCredentialResponse = {
  credential: string
  select_by: string
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: GoogleCredentialResponse) => void
          }) => void
          prompt: () => void
        }
      }
    }
  }
}

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() ?? ''

function App() {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [nameNotice, setNameNotice] = useState('')
  const [googleStatus, setGoogleStatus] = useState(() =>
    googleClientId ? 'Ready to sync with Google' : 'Add VITE_GOOGLE_CLIENT_ID to .env',
  )

  useEffect(() => {
    if (!googleClientId) {
      return
    }

    const initializeGoogle = () => {
      window.google?.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response) => {
          setGoogleStatus(`Google token received (${response.select_by})`)
          console.log('Google ID token:', response.credential)
        },
      })
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]',
    )

    if (existingScript) {
      initializeGoogle()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = initializeGoogle
    script.onerror = () => setGoogleStatus('Could not load Google sign-in')
    document.head.appendChild(script)
  }, [])

  const continueLocally = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedName = name.trim()

    if (!trimmedName) {
      setNameNotice('Enter your name')
      return
    }

    setNameNotice('')
    localStorage.setItem('kanri:userName', trimmedName)
  }

  const createSyncAccount = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    console.log('Create sync account:', { username, password })
  }

  const signInWithGoogle = () => {
    if (!googleClientId) {
      setGoogleStatus('Missing Google client ID')
      return
    }

    window.google?.accounts.id.prompt()
  }

  return (
    <main className="signup-shell min-h-svh grid place-items-center p-4 sm:p-6">
      <section className="signup-panel w-full max-w-6xl" aria-labelledby="signup-title">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-0 xl:gap-12 p-6 sm:p-8">
          <div>
            <div className="brand-row">
              <img src="src/assets/kanri-logo.png" width="80" height="80" alt="Kanri logo" />
              {nameNotice && <p className="name-notice">{nameNotice}</p>}
            </div>
            <h1>Kanri</h1>
            <p className="tagline">
              More than a to-do list. Made for real workflow.
            </p>
            <p className="signup-copy">
              Start instantly.
            </p>
            <form className="signup-form" onSubmit={continueLocally}>
              <label htmlFor="name">What should we call you?</label>
              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(event) => {
                  setName(event.target.value)
                  setNameNotice('')
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
              <label htmlFor="username">Username (only letters and numbers)</label>
              <input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value)
                }}
                placeholder="sankarsana3012"
                autoComplete="username"
              />
              <label htmlFor="password">Password (at least 8 characters)</label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                }}
                placeholder="Enter a secure password"
              />
              <button type="submit">Create sync account</button>
            </form>

            <button type="button" className="google-button" onClick={signInWithGoogle}>
              <img src={googleLogo} alt="" width="20" height="20" />
              <span>Continue with Google</span>
            </button>
            <p className="auth-status">{googleStatus}</p>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
