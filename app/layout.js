import './globals.css'
import Sidebar from './components/Sidebar'
import Header from './components/Header'

export const metadata = {
  title: 'Shemet Agent',
  description: 'Agency dashboard for Shemet',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        <Header />
        <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)' }}>
          <Sidebar />
          <div style={{ marginLeft: 240, flex: 1, overflowY: 'auto', background: '#f0f2f5' }}>
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}
