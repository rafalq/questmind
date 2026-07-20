export default function Footer() {
  return (
    <footer className="border-t border-border px-4 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-text-muted">
      <span className="text-xs tracking-widest">QUESTMIND</span>
      <span className="text-xs text-center sm:text-left">
        © {new Date().getFullYear()} · AI-Powered Tabletop RPG Game Master
      </span>
    </footer>
  )
}
