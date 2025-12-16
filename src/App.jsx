import React from 'react'
import ChatInterface from './components/ChatInterface'
import './styles/App.css'

function App() {
  return (
    <div className="app">
      <ChatInterface agentDescription="An intelligent customer support agent that searches documentation, provides accurate answers, collects detailed issue information, and knows when to escalate to humans" />
    </div>
  )
}

export default App
