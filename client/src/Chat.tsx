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
    const files = formData.getAll('files') as File[]
    const form = new FormData()

    if (files.some((file) => file.type !== 'application/pdf')) {
      alert('Error: Only PDF files are allowed.')
      return
    }

    if (files.length > 5) {
      alert('Select 5 max maximum files')
      return
    }

    if (files.length && params.userID && params.workspaceID) {
      files.forEach((file) => {
        form.append('files', file)
      })
      form.append('user_id', params.userID)
      form.append('workspace_id', params.workspaceID)

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
          method: 'POST',
          body: form,
        })

        const data = await response.json()
        const fileList = data.files_list || []

        const uploads = await getUploads(params.userID, params.workspaceID)
        setUploads(uploads)

        await Promise.all(
          fileList.map((item: { file_key: string; file_path: string }) => {
            if (item.file_key && item.file_path) {
              fetch(`${import.meta.env.VITE_API_URL}/ingest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  user_id: params.userID,
                  file_path: item.file_path,
                  workspace_id: params.workspaceID,
                  file_key: item.file_key,
                }),
              })
            }
          }),
        )
      } catch (error) {
        console.log('Error', error)
      }
    }
  }

  const formLiveUrlAction = async (formData: FormData) => {
    const url = formData.get('url') as File

    if (url && params.userID && params.workspaceID) {
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/ingest_live_url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: params.userID,
            url_list: url,
            workspace_id: params.workspaceID,
          }),
        })

        const uploads = await getUploads(params.userID, params.workspaceID)
        setUploads(uploads)
      } catch (error) {
        console.log('Error live feeding', error)
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
      <div className={styles.inputCard}>
        <div>
          <h2 className={styles.sectionTitle}>Upload Document</h2>
          <span>Select max 5 PDF</span>

          <form
            className={styles.uploadForm}
            onSubmit={async (e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              await formAction(formData)
            }}
            encType='multipart/form-data'
          >
            <input
              type='file'
              name='files'
              id='files'
              accept='.pdf'
              multiple={true}
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
        <div>
          <h2 className={styles.sectionTitle}>Feed Live link</h2>

          <span>Input url</span>
          <form
            className={styles.uploadForm}
            onSubmit={async (e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              await formLiveUrlAction(formData)
            }}
          >
            <input
              type='text'
              name='url'
              id='url'
              className={styles.fileInput}
            />

            <button
              className={styles.primaryBtn}
              type='submit'
            >
              Feed link
            </button>
          </form>
        </div>
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
