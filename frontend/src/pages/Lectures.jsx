import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import api from '../api'

// YouTube link se video ID nikaalo (youtu.be/XXX, watch?v=XXX, embed/XXX)
function getYouTubeId(url) {
  if (!url) return null
  const patterns = [
    /youtu\.be\/([\w-]{11})/,
    /[?&]v=([\w-]{11})/,
    /youtube\.com\/embed\/([\w-]{11})/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

// seconds -> "5:30"
function secondsToStr(sec) {
  const s = Number(sec) || 0
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const ss = s % 60
  const pad = (n) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(ss)}` : `${m}:${pad(ss)}`
}

function Lectures() {
  const { user } = useOutletContext()
  const isVisitor = user.role === 'VISITOR'

  const [lectures, setLectures] = useState([])
  const [loading, setLoading] = useState(true)
  const [watching, setWatching] = useState(null) // kaunsi lecture dekh rahe
  const [startAt, setStartAt] = useState(0) // chapter click par is second se chale

  useEffect(() => {
    if (isVisitor) {
      setLoading(false)
      return
    }
    api
      .get('/lectures/')
      .then((res) => setLectures(res.data))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Visitor enrolled nahi
  if (isVisitor) {
    return (
      <>
        <div className="topbar">
          <h1>Lectures</h1>
        </div>
        <div className="content-card">
          <p>You are not enrolled, so recorded lectures are not available.</p>
          <p className="muted">Please contact Sir to get your id and password.</p>
        </div>
      </>
    )
  }

  // ===== Watch view (ek lecture khuli hai) =====
  if (watching) {
    const videoId = getYouTubeId(watching.youtube_url)
    // start param se video us waqt se chale (chapter click par)
    const embedUrl = videoId
      ? `https://www.youtube.com/embed/${videoId}?start=${startAt}&autoplay=1&rel=0`
      : null

    return (
      <>
        <div className="topbar">
          <button className="btn-cancel" onClick={() => setWatching(null)}>
            ◀ Back to lectures
          </button>
        </div>

        {watching.course_name && <span className="course-label">{watching.course_name}</span>}
        <h2 className="lecture-heading">{watching.display_title}</h2>
        <div className="class-meta lecture-submeta">
          <span>📅 {watching.class_date}</span>
          {watching.class_start_time && <span>🕒 {watching.class_start_time.slice(0, 5)}</span>}
          <span>👨‍🏫 {watching.teacher_name || 'No instructor'}</span>
        </div>

        {embedUrl ? (
          <div className="video-wrap">
            {/* key badalne se iframe reload hota hai -> naye start par jump */}
            <iframe
              key={startAt}
              src={embedUrl}
              title={watching.display_title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        ) : (
          <div className="content-card">
            <p className="muted">Invalid video link.</p>
            <a href={watching.youtube_url} target="_blank" rel="noreferrer">
              Open on YouTube
            </a>
          </div>
        )}

        {watching.chapters && watching.chapters.length > 0 && (
          <div className="content-card chapters-card">
            <h3>Chapters</h3>
            <ul className="chapter-list">
              {watching.chapters.map((ch, i) => (
                <li key={i}>
                  <button
                    className={'chapter-item' + (startAt === ch.time ? ' chapter-active' : '')}
                    onClick={() => setStartAt(ch.time)}
                  >
                    <span className="chapter-name">{ch.title}</span>
                    <span className="chapter-stamp">{secondsToStr(ch.time)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </>
    )
  }

  // ===== List view =====
  return (
    <>
      <div className="topbar">
        <h1>Lectures</h1>
      </div>

      {loading ? (
        <p className="muted">Loading...</p>
      ) : lectures.length === 0 ? (
        <div className="content-card">
          <p className="muted">No recorded lectures yet.</p>
        </div>
      ) : (
        <div className="class-list">
          {lectures.map((lec) => (
            <div className="class-card" key={lec.id}>
              <div className="class-main">
                {lec.course_name && <span className="course-label">{lec.course_name}</span>}
                <h3>🎬 {lec.display_title}</h3>
                <div className="class-meta">
                  <span>📅 {lec.class_date}</span>
                  {lec.class_start_time && <span>🕒 {lec.class_start_time.slice(0, 5)}</span>}
                  <span>👨‍🏫 {lec.teacher_name || 'No instructor'}</span>
                </div>
              </div>
              <div className="class-actions">
                <button
                  className="btn-small btn-join"
                  onClick={() => {
                    setStartAt(0)
                    setWatching(lec)
                  }}
                >
                  Watch
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default Lectures
