import React, { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import '../styles/ChatInterface.css'

function ChatInterface({ agentDescription }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(true)
  const [provider, setProvider] = useState('anthropic')
  const [apiKey, setApiKey] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    const savedProvider = localStorage.getItem('aiProvider')
    const savedApiKey = localStorage.getItem('aiApiKey')

    if (savedProvider) setProvider(savedProvider)
    if (savedApiKey) {
      setApiKey(savedApiKey)
      setShowSettings(false)
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const saveSettings = () => {
    if (!apiKey.trim()) {
      alert('Please enter your API key')
      return
    }
    localStorage.setItem('aiProvider', provider)
    localStorage.setItem('aiApiKey', apiKey)
    setShowSettings(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    if (showSettings || !apiKey) {
      alert('Please configure your API key in settings first')
      setShowSettings(true)
      return
    }

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          provider: provider,
          apiKey: apiKey,
          messages: [...messages, userMessage]
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to get response')
      }

      const data = await response.json()
      const assistantMessage = {
        role: 'assistant',
        content: data.content
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${error.message}. Please check your API key in settings.`
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h1>{agentDescription}</h1>
        <button onClick={() => setShowSettings(!showSettings)} className="settings-btn">
          ⚙️ Settings
        </button>
      </header>

      {showSettings && (
        <div className="settings-modal">
          <div className="settings-content">
            <h2>Configure AI Provider</h2>
            <div className="setting-group">
              <label>Provider:</label>
              <select value={provider} onChange={(e) => setProvider(e.target.value)}>
                <option value="anthropic">Anthropic (Claude)</option>
                <option value="openai">OpenAI (GPT-4)</option>
              </select>
            </div>
            <div className="setting-group">
              <label>API Key:</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
              />
            </div>
            <p className="settings-help">
              {provider === 'anthropic'
                ? 'Get your key at: console.anthropic.com'
                : 'Get your key at: platform.openai.com'}
            </p>
            <button onClick={saveSettings} className="save-btn">
              Save & Start
            </button>
          </div>
        </div>
      )}

      <div className="messages">
        {messages.length === 0 && !showSettings && (
          <div className="welcome-message">
            <h2>Welcome!</h2>
            <p>Start chatting with {agentDescription}</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="message-content">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message assistant">
            <div className="message-content loading">
              <span className="loading-dot">.</span>
              <span className="loading-dot">.</span>
              <span className="loading-dot">.</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading || showSettings}
        />
        <button type="submit" disabled={isLoading || showSettings}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  )
}

export default ChatInterface
