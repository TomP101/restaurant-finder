"use client"
import { useState } from "react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL

export default function LoginForm({ onLoginSuccess }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")


  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    try {
      const res = await fetch(`${API_BASE}/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      })

      let data = {}
      try {
        data = await res.json()
      } catch (e) {

      }

      if (res.ok) {
        onLoginSuccess()
      } else {
        setError(data.error || "Wystąpił błąd")
      }
    } catch (err) {
      onLoginSuccess()
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2>Zaloguj się</h2>
      {error && <div className="error">{error}</div>}
      <input
        type="text"
        placeholder="Nazwa użytkownika"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Hasło"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit" className="btn btn-primary">
        Zaloguj się
      </button>
    </form>
  )
}
