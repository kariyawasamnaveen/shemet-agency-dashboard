import './globals.css'
import LayoutWrapper from './layout-wrapper'
import { AgencyProvider } from './context/AgencyContext'

export const metadata = {
  title: 'Shemet Agent',
  description: 'Agency dashboard for Shemet',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AgencyProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </AgencyProvider>
      </body>
    </html>
  )
}
