import React from 'react'
import { useParams } from 'react-router'

export default function AskContainer() {
  const params = useParams()

  const [aiAnswer, setAiAnswer] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

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
          top_k: top_k,
          query,
        }),
      })

      const data = await response.json()
      const queryResults = data.query_results

      if (queryResults.result) {
        setAiAnswer(queryResults.result)
      }
    } catch (error) {
      console.log('error in query', error)
      setAiAnswer('Failed')
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div style={{ display: 'flex', gap: '200' }}>
      <form action={formActionHandler}>
        <label htmlFor='query'>Ask a question</label>
        <br />
        <br />

        <textarea
          name='query'
          id='query'
        ></textarea>
        <br />
        <label htmlFor='top_k'>Top K</label>
        <br />
        <input
          name='top_k'
          id='top_k'
          defaultValue={5}
          type='number'
        ></input>
        <br />
        <br />
        <button type='submit'>Ask</button>
      </form>
      <div style={{ width: '20px', padding: '10px' }}></div>

      <div>{isLoading ? 'Thinking...' : aiAnswer}</div>
    </div>
  )
}
