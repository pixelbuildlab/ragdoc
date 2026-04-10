import { useNavigate, useParams } from 'react-router'
import { useUserStore } from './useUserStore'
import Workspace from './Workspace'
import React from 'react'
import AskContainer from './AskContainer'

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

  const { clearStore, setUploads } = useUserStore()

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
            headers: {
              'Content-Type': 'application/json',
            },
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
    <div>
      <hr />
      <br />
      <div>
        <form action={formAction}>
          <label htmlFor='file'>Upload Document</label>
          <input
            type='file'
            name='file'
            id='file'
            accept='.pdf'
          />
          <button type='submit'>Upload</button>
        </form>
      </div>
      <hr />

      <AskContainer />
      <hr />
      <br />

      <button onClick={clearUser}>Clear User</button>
      <hr />
      <div>
        <Workspace />
      </div>
    </div>
  )
}

export default Chat
