"use client"

import { useEffect, useState } from "react"

export default function SignIn() {
  const [csrfToken, setCsrfToken] = useState("")

  useEffect(() => {
    let isMounted = true
    fetch("/api/auth/csrf")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.csrfToken) {
          setCsrfToken(data.csrfToken)
        }
      })
      .catch(() => {
        if (isMounted) setCsrfToken("")
      })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="relative min-h-screen flex  items-center justify-center   overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 pointer-events-none z-[1] bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.6)_80%)]" />
      <div className="absolute inset-0 bg-background/50" />
      <div className="absolute top-0 left-0 right-0 h-[35%] bg-gradient-to-b from-black/90 via-black/60 to-transparent z-[2]" />
      <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-background via-background/80 to-transparent z-[2]" />

      <div className="relative z-10    w-full max-w-6xl md:max-w-xl   gap-4 md:gap-12 px-6 md:py-20  md:px-10">
        <div className="space-y-6">
          <p className="text-sm uppercase tracking-[0.35em] text-foreground/50">Sign in</p>
          <h1
            className="text-4xl font-medium tracking-[-1px] md:text-5xl"
            style={{ fontFamily: 'az, ui-sans-serif' }}
          >
            Track every <span className="font-serif italic font-normal">rupee</span>, without friction.
          </h1>
          
        </div>

        <div className="relative mt-7">
          <div className="absolute -inset-3 rounded-[32px] bg-white/10 blur-2xl" />
          <div className="relative rounded-[28px] border border-white/10 bg-white/5 p-8 shadow-[0_40px_120px_-80px_rgba(0,0,0,0.7)] backdrop-blur">
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-foreground/50">Continue</p>
                <h2
                  className="text-2xl font-medium"
                  style={{ fontFamily: 'az, ui-sans-serif' }}
                >
                  Sign in with Google
                </h2>
                <p className="text-sm text-foreground/60">
                  Use your Google account to authenticate and return to your dashboard.
                </p>
              </div>

              <form method="post" action="/api/auth/signin/google" className="space-y-4">
                <input name="csrfToken" type="hidden" value={csrfToken} />
                <input name="callbackUrl" type="hidden" value="/dashboard" />
                <button
                  className="group flex cursor-pointer w-full items-center justify-between rounded-2xl border border-white/15 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 shadow-lg transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-16px_rgba(255,255,255,0.5)]"
                  type="submit"
                >
                  <span className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-zinc-900">
                      <svg
                        aria-hidden="true"
                        focusable="false"
                        viewBox="0 0 48 48"
                        className="h-6 w-6"
                      >
                        <path
                          fill="#EA4335"
                          d="M24 9.5c3.34 0 6.31 1.3 8.58 3.4l6.39-6.39C34.97 2.66 29.84 0 24 0 14.61 0 6.45 5.4 2.47 13.26l7.44 5.78C11.62 12.3 17.33 9.5 24 9.5z"
                        />
                        <path
                          fill="#4285F4"
                          d="M46.52 24.5c0-1.64-.15-3.22-.43-4.75H24v9.02h12.62c-.54 2.9-2.17 5.36-4.62 7.02l7.06 5.49c4.13-3.81 6.46-9.41 6.46-16.78z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M9.91 28.99a14.43 14.43 0 0 1 0-9.97l-7.44-5.78A24 24 0 0 0 0 24c0 3.89.93 7.57 2.47 10.76l7.44-5.77z"
                        />
                        <path
                          fill="#34A853"
                          d="M24 48c6.48 0 11.92-2.13 15.9-5.72l-7.06-5.49c-1.96 1.32-4.46 2.1-8.84 2.1-6.67 0-12.38-4.5-14.09-10.9l-7.44 5.77C6.45 42.6 14.61 48 24 48z"
                        />
                      </svg>
                    </span>
                    <span >Continue with Google</span>
                  </span>
                  <span className="text-xs text-zinc-500 transition group-hover:text-zinc-700">Secure</span>
                </button>
              </form>

              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-foreground/60">
                By continuing you agree to our terms and acknowledge the privacy policy.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
