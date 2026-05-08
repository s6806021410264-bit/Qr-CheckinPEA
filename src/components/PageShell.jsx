// src/components/PageShell.jsx
export default function PageShell({ logo, title, subtitle, children }) {
  const todayStr = new Date().toLocaleDateString('th-TH', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
  return (
    <div className="page">
      <header className="header">
        <div className="logo">{logo}</div>
        <h1 className="title">{title}</h1>
        <p className="subtitle">{subtitle ?? todayStr}</p>
      </header>
      {children}
      <footer className="footer">
        <span>Powered by Supabase + React</span>
      </footer>
    </div>
  )
}
