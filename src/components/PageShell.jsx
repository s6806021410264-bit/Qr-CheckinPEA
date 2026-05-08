// src/components/PageShell.jsx
export default function PageShell({ logo, title, subtitle, children, theme, onToggleTheme }) {
  const todayStr = new Date().toLocaleDateString('th-TH', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
  return (
    <div className="page">
      {onToggleTheme && (
        <button
          type="button"
          className="theme-toggle"
          onClick={onToggleTheme}
          title={theme === 'light' ? 'เปลี่ยนเป็นโหมดมืด' : 'เปลี่ยนเป็นโหมดสว่าง'}
        >
          {theme === 'light' ? '☾' : '☀'}
        </button>
      )}
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
