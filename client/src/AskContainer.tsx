import React from 'react'
import { useParams } from 'react-router'
import styles from './styles/AskContainer.module.css'

export default function AskContainer() {
  const params = useParams()

  const [aiAnswer, setAiAnswer] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  const [sources, setSources] = React.useState<string[]>([])

  const formActionHandler = async (formData: FormData) => {
    try {
      setIsLoading(true)

      const query = formData.get('query')
      const top_k = formData.get('top_k')

      const workspaceID = params.workspaceID
      const userID = params.userID

      if (!query || !workspaceID || !userID) {
        console.log('Missing query values')
        return
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userID,
          workspace_id: workspaceID,
          top_k,
          query,
        }),
      })

      const data = await response.json()
      const queryResults = data.query_results

      if (queryResults?.result) {
        setAiAnswer(queryResults.result)
      }

      if (queryResults?.context?.length) {
        const filesMap: string[] = queryResults?.context.map(
          ({ source }: { source: string }) => source,
        )

        setSources([...new Set(filesMap)])
      } else {
        setSources([])
      }
    } catch (error) {
      console.log('error in query', error)
      setAiAnswer('Failed')
      setSources([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.panel}>
        <h2 className={styles.title}>Ask your documents</h2>
        <form
          className={styles.form}
          onSubmit={async (e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            await formActionHandler(formData)
          }}
        >
          <label className={styles.label}>Question</label>

          <textarea
            className={styles.textarea}
            name='query'
            placeholder='Ask something from your uploaded PDFs...'
          />

          <label className={styles.label}>Top K</label>

          <input
            className={styles.input}
            name='top_k'
            type='number'
            defaultValue={5}
          />

          <button
            className={styles.button}
            type='submit'
          >
            {isLoading ? 'Thinking...' : 'Ask AI'}
          </button>
        </form>
      </div>

      <div className={styles.panel}>
        <h2 className={styles.title}>AI Response</h2>

        <div className={styles.answerBox}>
          {isLoading
            ? 'Analyzing documents...'
            : aiAnswer || 'Your answer will appear here.'}
        </div>

        <div className={styles.sourcesSection}>
          <h3 className={styles.sourcesTitle}>Sources</h3>

          <div className={styles.sourcesList}>
            {sources.length ? (
              sources.map((src, idx) => (
                <div
                  key={idx}
                  className={styles.sourceItem}
                >
                  <div className={styles.fileName}>📄 {src}</div>

                  {/* {src && <div className={styles.filePath}>{src}</div>} */}
                </div>
              ))
            ) : (
              <div className={styles.noSources}>No sources available yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
