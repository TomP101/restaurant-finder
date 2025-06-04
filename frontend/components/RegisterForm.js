"use client"

import { useState } from "react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL

export default function RegisterForm({ onRegisterSuccess }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      })
      if (res.ok) {
        onRegisterSuccess()
      } else {
        const data = await res.json()
        setError(data.error || "Rejestracja nie powiodła się")
      }
    } catch (err) {
      setError("Błąd serwera")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>Rejestracja</h2>
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
      {error && <p className="error-msg">{error}</p>}
      <button type="submit">Zarejestruj</button>
    </form>
  )
}
