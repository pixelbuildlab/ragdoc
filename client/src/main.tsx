import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Chat from './Chat.tsx'

const router = createBrowserRouter([
  {
    path: '*',
    element: <App />,
  },
  {
    path: '/',
    element: <App />,
  },
  { path: '/u/:userID/:workspaceID', element: <Chat /> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
