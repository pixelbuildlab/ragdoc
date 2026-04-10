import { Link, useParams } from 'react-router'
import { useUserStore } from './useUserStore'

export default function Workspace() {
  const params = useParams()
  const { workspaces, setWorkspaces, uploads } = useUserStore()

  const createWorkspaces = async (formData: FormData) => {
    const name = formData.get('name')
    const description = formData.get('description')
    const tags = formData.get('tags')

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/workspace`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: params.userID,
            name,
            description,
            tags,
          }),
        },
      )

      const workspacesData = await response.json()
      if (workspacesData.workspaces) {
        setWorkspaces(workspacesData.workspaces)
      }
    } catch (error) {
      console.log('Failed creating workspace', error)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '240px' }}>
        <div>
          {workspaces.map((workspace) => (
            <div key={`${workspace.id}`}>
              <Link
                to={`/u/${params.userID}/${workspace.id}`}
                style={{ textDecoration: 'none' }}
                title={workspace.description ?? ''}
              >
                <b>{workspace.name}</b>
              </Link>
              {params.workspaceID
                ? workspace.id === +params.workspaceID
                  ? ' **'
                  : ''
                : ''}
            </div>
          ))}
        </div>
        <div>
          Files
          <div
            style={{ height: '120px', overflow: 'auto', paddingRight: '20px' }}
          >
            {uploads.length ? (
              uploads.map((file) => (
                <div key={`${file.id}`}>{file.file_name}</div>
              ))
            ) : (
              <>No Files</>
            )}
          </div>
        </div>

        <form action={createWorkspaces}>
          <b>Create workspace</b>
          <br />
          <label htmlFor='name'>Name</label>
          <br />
          <input
            autoComplete='false'
            type='text'
            name='name'
            id='name'
          />
          <br />
          <label htmlFor='description'>Description</label>
          <br />
          <input
            autoComplete='false'
            type='text'
            name='description'
            id='description'
          />
          <br />
          <label htmlFor='tags'>Tags</label>
          <br />
          <input
            autoComplete='false'
            type='text'
            name='tags'
            id='tags'
          />
          <br />
          <br />
          <button type='submit'>Create</button>
        </form>
      </div>
      <br />
    </div>
  )
}
