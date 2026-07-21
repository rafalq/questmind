// Session screen owns the full viewport: no navbar, no footer, no page
// scroll. The chat manages its own scrolling, and a composer pinned to the
// bottom only works if nothing else can grow the document.
export default function PlayLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="flex h-dvh flex-col overflow-hidden">{children}</div>
}
