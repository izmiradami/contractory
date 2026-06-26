import { Sidebar }        from '@/components/layout/sidebar/sidebar'
import { Header }         from '@/components/layout/header/header'
import { ArcGrid }        from '@/components/layout/background/arc-grid'
import { CommandPalette } from '@/components/layout/command-palette/command-palette'
import { PlatformShell } from '@/components/layout/platform-shell'
import { ErrorBoundary }  from '@/components/shared/error-boundary'

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <PlatformShell>
      <div className="relative flex h-screen overflow-hidden bg-background-primary">
        {/* Signature background */}
        <ArcGrid />

        {/* Sidebar */}
        <Sidebar />

        {/* Main area */}
        <div className="relative flex flex-1 flex-col overflow-hidden">
          <Header />

          <main
            id="main-content"
            className="flex-1 overflow-y-auto"
            tabIndex={-1}
          >
            <div className="mx-auto max-w-[1280px] px-6 py-8">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </div>
          </main>
        </div>

        {/* Global command palette */}
        <CommandPalette />
      </div>
    </PlatformShell>
  )
}
