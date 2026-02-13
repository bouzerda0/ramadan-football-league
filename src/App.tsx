import { useState } from 'react'

function App() {
  return (
    <div className="app-container">
      <header className="header">
        <h1>Zone 01 Oujda</h1>
        <h2>Ramadan Football League 2026</h2>
      </header>
      <main className="main-content">
        <div className="card">
          <h3>Welcome to the League</h3>
          <p>Experience the excitement of Ramadan football.</p>
          <div className="actions">
            <button className="cta-button">View Matches</button>
            <button className="secondary-button">Team Standings</button>
          </div>
        </div>
      </main>
      <footer className="footer">
        <p>&copy; 2026 Zone 01 Oujda. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default App
