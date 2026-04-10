import { Link, useParams } from 'react-router'
import { useUserStore } from './useUserStore'
import styles from './styles/Workspace.module.css'

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
    <div className={styles.wrapper}>
      {/* Workspaces list */}
      <div className={styles.card}>
        <h3 className={styles.title}>Workspaces</h3>

        <div className={styles.list}>
          {workspaces.map((workspace) => (
            <div
              key={workspace.id}
              className={styles.item}
            >
              <Link
                to={`/u/${params.userID}/${workspace.id}`}
                className={styles.link}
                title={`${workspace.description} - ${workspace.tags}`}
              >
                {workspace.name}
              </Link>

              {params.workspaceID && workspace.id === +params.workspaceID ? (
                <span className={styles.active}>●</span>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {/* Files */}
      <div className={styles.card}>
        <h3 className={styles.title}>Files</h3>

        <div className={styles.files}>
          {uploads.length ? (
            uploads.map((file) => (
              <div
                key={file.id}
                className={styles.fileItem}
              >
                {file.file_name}
              </div>
            ))
          ) : (
            <div className={styles.empty}>No Files</div>
          )}
        </div>
      </div>

      {/* Create workspace */}
      <div className={styles.card}>
        <h3 className={styles.title}>Create Workspace</h3>

        <form
          className={styles.form}
          onSubmit={async (e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            await createWorkspaces(formData)
          }}
        >
          <input
            className={styles.input}
            type='text'
            name='name'
            placeholder='Workspace name'
          />

          <input
            className={styles.input}
            type='text'
            name='description'
            placeholder='Description'
          />

          <input
            className={styles.input}
            type='text'
            name='tags'
            placeholder='Tags (comma separated)'
          />

          <button
            type='submit'
            className={styles.button}
          >
            Create
          </button>
        </form>
      </div>
    </div>
  )
}
