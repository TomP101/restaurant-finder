"use client"
import { useEffect, useState } from "react"

export default function Navbar({ onHomeClick, onLoginClick, onRegisterClick, onLogoutClick, onProfileClick,currentUser }) {


  const handleLogoutClick = async () => {
    try {
      await fetch("http://localhost:8000/api/logout/", {
        method: "GET",
        credentials: "include",
      })
      onLogoutClick()
    } catch (err) {
      console.error("Błąd wylogowywania:", err)
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <h1 className="navbar-logo" onClick={onHomeClick}>
          🍽️ RestaurantFinder
        </h1>
        <div className="navbar-buttons">
          {currentUser ? (
              <>
                <span className="navbar-user">👤 {currentUser}</span>
                <button className="btn btn-outline" onClick={handleLogoutClick}>Wyloguj się</button>
                <button className="btn btn-outline" onClick={onProfileClick}>Mój profil</button>
              </>
          ) : (
              <>
                <button className="btn btn-outline" onClick={onLoginClick}>Zaloguj się</button>
              <button className="btn btn-primary" onClick={onRegisterClick}>Zarejestruj się</button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
