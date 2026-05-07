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
  const [googleStatus, setGoogleStatus] = useState('Ready to sync with Google')

  useEffect(() => {
    if (!googleClientId) {
      setGoogleStatus('Add VITE_GOOGLE_CLIENT_ID to .env')
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
      return
    }

    localStorage.setItem('kanri:userName', trimmedName)
  }

  const signInWithGoogle = () => {
    if (!googleClientId) {
      setGoogleStatus('Missing Google client ID')
      return
    }

    window.google?.accounts.id.prompt()
  }

  return (
    <main className="signup-shell">
      <section className="signup-panel" aria-labelledby="signup-title">
        <img src='src/assets/kanri-logo.png' width="80" height="80" alt="Kanri logo"/>
        <h1>Kanri</h1>
        <p className="tagline">Start your flow.</p>
        <p className="signup-copy">
          Use Kanri locally on this device, or sign in when you want sync.
        </p>

        <form className="local-form" onSubmit={continueLocally}>
          <label htmlFor="name">What should I call you?</label>
          <input
            id="name"
            name="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Sankarsana"
            autoComplete="given-name"
          />
          <button type="submit" disabled={!name.trim()}>
            Continue locally
          </button>
        </form>

        <div className="divider">
          <span>or</span>
        </div>

        <button type="button" className="google-button" onClick={signInWithGoogle}>
          <img src={googleLogo} alt="" width="20" height="20" />
          Continue with Google
        </button>

        <p className="auth-status">{googleStatus}</p>
      </section>
    </main>
  )
}

export default App
