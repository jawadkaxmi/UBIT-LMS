import { useEffect, useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import api from '../api'

// Backend ka WebSocket address (api.js ke baseURL se banaya)
const WS_URL = 'ws://127.0.0.1:8000/ws/chat/'

function Chat() {
  const { user } = useOutletContext()
  const isAdmin = user.role === 'ADMIN'

  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [connected, setConnected] = useState(false)

  const socketRef = useRef(null)
  const bottomRef = useRef(null)

  // Naye message par neeche scroll
  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    // 1) Purani messages load karo (history)
    api.get('/chat/messages/').then((res) => setMessages(res.data))

    // 2) WebSocket connect karo (token URL mein bhejte hain)
    const token = localStorage.getItem('access')
    const ws = new WebSocket(`${WS_URL}?token=${token}`)
    socketRef.current = ws

    ws.onopen = () => setConnected(true)
    ws.onclose = () => setConnected(false)
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'message') {
        setMessages((prev) => [...prev, data.message])
      }
    }

    // Page chhodte waqt connection band
    return () => ws.close()
  }, [])

  useEffect(scrollToBottom, [messages])

  const send = (e) => {
    e.preventDefault()
    const content = text.trim()
    if (!content || !connected) return
    socketRef.current.send(JSON.stringify({ content }))
    setText('')
  }

  const deleteMessage = async (m) => {
    if (!window.confirm('Delete this message?')) return
    await api.delete(`/chat/messages/${m.id}/`)
    setMessages((prev) => prev.filter((x) => x.id !== m.id))
  }

  const timeOf = (iso) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="chat-page">
      <div className="topbar">
        <h1>Discussion</h1>
        <span className={'conn ' + (connected ? 'conn-on' : 'conn-off')}>
          {connected ? '🟢 Connected' : '⚪ Connecting…'}
        </span>
      </div>

      {/* Messages */}
      <div className="chat-window">
        {messages.length === 0 ? (
          <p className="muted chat-empty">No messages yet. Say hello 👋</p>
        ) : (
          messages.map((m) => {
            const mine = m.author === user.id
            return (
              <div key={m.id} className={'msg-row' + (mine ? ' mine' : '')}>
                <div className="msg">
                  {!mine && (
                    <div className="msg-head">
                      <span className="msg-author">{m.author_name}</span>
                      {m.author_role === 'ADMIN' && <span className="msg-tag">Sir</span>}
                    </div>
                  )}
                  <div className="msg-body">{m.content}</div>
                  <div className="msg-time">
                    {timeOf(m.created_at)}
                    {/* Sir kisi bhi message ko delete kar sakta hai */}
                    {isAdmin && (
                      <button className="msg-del" onClick={() => deleteMessage(m)} title="Delete">
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef}></div>
      </div>

      {/* Input */}
      <form className="chat-input" onSubmit={send}>
        <input
          className="field-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
        />
        <button className="btn-primary btn-inline" type="submit" disabled={!connected}>
          Send
        </button>
      </form>
    </div>
  )
}

export default Chat
