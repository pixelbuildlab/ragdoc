import React from 'react'
import { useNavigate } from 'react-router'
import styles from './styles/App.module.css'
import { useUserStore } from './useUserStore'

function App() {
  const { setUser, setWorkspaces, user, workspaces, setUploads } =
    useUserStore()
  const navigate = useNavigate()

  const setupUser = React.useCallback(
    async (email: string) => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/access`, {
          method: 'POST',
          body: JSON.stringify({ email }),
          headers: { 'Content-Type': 'application/json' },
        })

        const data = await res.json()

        setUser(data.user)
        setWorkspaces(data.user.workspaces)

        const defaultWorkspace = data.user.workspaces?.[0]?.id

        const params = {
          workspace_id: defaultWorkspace,
          user_id: data.user?.id,
        }

        const uploadParams = new URLSearchParams(params)

        const responseUploads = await fetch(
          `${import.meta.env.VITE_API_URL}/user_uploads?${uploadParams.toString()}`,
        )

        const uploadData = await responseUploads.json()

        if (uploadData.uploads) {
          setUploads(uploadData.uploads)
        }

        navigate(`/u/${data.user?.id}/${defaultWorkspace}`)
      } catch (err) {
        console.error('Fetch error:', err)
      }
    },
    [navigate, setUploads, setUser, setWorkspaces],
  )

  React.useEffect(() => {
    const email = localStorage.getItem('BOT_USER_EMAIL')

    if (email && !user) {
      setupUser(email)
    }

    if (user) {
      navigate(`/u/${user?.id}/${workspaces?.[0]?.id}`)
    }
  }, [navigate, setupUser, user, workspaces])

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>DocRAG AI</div>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>
          Sign up with your email to continue to your workspace.
        </p>

        <form
          className={styles.form}
          onSubmit={async (e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            const email = formData.get('email')
            if (!email) return

            localStorage.removeItem('BOT_USER_EMAIL')
            localStorage.setItem('BOT_USER_EMAIL', email.toString())
            await setupUser(email.toString())
          }}
        >
          <div className={styles.formGroup}>
            <label
              className={styles.label}
              htmlFor='email'
            >
              Email address
            </label>
            <input
              className={styles.input}
              id='email'
              name='email'
              type='email'
              placeholder='you@example.com'
              autoComplete='off'
            />
          </div>

          <button
            className={styles.button}
            type='submit'
          >
            Continue to dashboard
          </button>
        </form>
      </div>
    </div>
  )
}

export default App
