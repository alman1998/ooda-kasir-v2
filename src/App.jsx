import { useStore } from './store/useStore.js'
import { Sidebar }     from './components/layout/Sidebar.jsx'
import { POSPage }     from './pages/POSPage.jsx'
import { DashboardPage } from './pages/DashboardPage.jsx'
import { ManagePage }  from './pages/ManagePage.jsx'
import { SetupPage }   from './pages/SetupPage.jsx'

function Toast() {
  const { toast } = useStore()
  if (!toast) return null
  return (
    <div className={`toast toast-${toast.type}`}>
      {toast.msg}
    </div>
  )
}

export default function App() {
  const { activePage } = useStore()

  const page = {
    pos:       <POSPage />,
    dashboard: <DashboardPage />,
    manage:    <ManagePage />,
    setup:     <SetupPage />,
  }[activePage] ?? <POSPage />

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        {page}
      </main>
      <Toast />
    </div>
  )
}
