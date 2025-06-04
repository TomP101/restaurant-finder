import "../styles/globals.css"
import "../styles/components.css"

export const metadata = {
  title: "Restaurant Finder",
  description: "Znajdź i oceniaj restauracje w Twojej okolicy",
}

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  )
}
