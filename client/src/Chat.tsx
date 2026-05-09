import { useNavigate, useParams } from 'react-router'
import { useUserStore } from './useUserStore'
import Workspace from './Workspace'
import React from 'react'
import AskContainer from './AskContainer'
import styles from './styles/Chat.module.css'

const getUploads = async (userID: string, workspaceID: string) => {
  const uploadParams = {
    workspace_id: workspaceID,
    user_id: userID,
  }

  const uploadParamsStr = new URLSearchParams(uploadParams)

  const responseUploads = await fetch(
    `${import.meta.env.VITE_API_URL}/user_uploads?${uploadParamsStr.toString()}`,
  )

  const uploadData = await responseUploads.json()

  return uploadData?.uploads
}

function Chat() {
  const params = useParams()
  const navigate = useNavigate()

  const { clearStore, setUploads, user } = useUserStore()

  const clearUser = () => {
    clearStore()
    localStorage.removeItem('BOT_USER_EMAIL')
    navigate('/')
  }

  React.useEffect(() => {
    const getSetUploads = async () => {
      if (params.userID && params.workspaceID) {
        const uploads = await getUploads(params.userID, params.workspaceID)
        setUploads(uploads)
      }
    }
    getSetUploads()
  }, [params.userID, params.workspaceID, setUploads])

  const formAction = async (formData: FormData) => {
    const file = formData.get('file') as File
    const form = new FormData()

    if (file.type !== 'application/pdf') {
      console.log('Select file')
      return
    }

    if (file && params.userID && params.workspaceID) {
      form.append('file', file)
      form.append('user_id', params.userID)
      form.append('workspace_id', params.workspaceID)

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
          method: 'POST',
          body: form,
        })

        const data = await response.json()

        const uploads = await getUploads(params.userID, params.workspaceID)
        setUploads(uploads)

        if (data.file_key && data.file_path) {
          await fetch(`${import.meta.env.VITE_API_URL}/ingest`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: params.userID,
              file_path: data.file_path,
              workspace_id: params.workspaceID,
              file_key: data.file_key,
            }),
          })
        }
      } catch (error) {
        console.log('Error', error)
      }
    }
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Workspace Dashboard</h1>
          <p className={styles.subtitle}>
            Upload documents, manage workspaces, and ask AI questions
          </p>
        </div>

        <div>
          <p>{user?.email}</p>
          <button
            className={styles.logoutBtn}
            onClick={clearUser}
          >
            Clear User
          </button>
        </div>
      </div>

      {/* Upload Section */}
      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>Upload Document</h2>

        <form
          className={styles.uploadForm}
          onSubmit={async (e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            await formAction(formData)
          }}
        >
          <input
            type='file'
            name='file'
            id='file'
            accept='.pdf'
            className={styles.fileInput}
          />

          <button
            className={styles.primaryBtn}
            type='submit'
          >
            Upload PDF
          </button>
        </form>
      </div>

      {/* Ask AI */}
      <AskContainer />

      {/* Bottom Grid */}
      <div style={{ marginTop: '20px' }}></div>
      <div className={styles.grid}>
        <div className={styles.card}>
          <Workspace />
        </div>
      </div>
    </div>
  )
}

export default Chat
