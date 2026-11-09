"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const isAdmin = (session?.user as Record<string, unknown>)?.role === "admin";

  return (
    <header className="sticky top-0 z-50 bg-nav-bg border-b border-nav-border">
      <nav className="mx-auto max-w-5xl px-5 sm:px-8 lg:px-10" aria-label="Navegación principal">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-fg no-underline shrink-0">
            <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-primary text-on-primary font-bold text-sm" aria-hidden="true">
              CV
            </span>
            <span className="font-bold text-base tracking-tight hidden sm:inline">CESFAM Cristo Vive</span>
            <span className="font-bold text-base tracking-tight sm:hidden">CESFAM</span>
          </Link>

          <ul className="hidden md:flex items-center gap-1 text-sm">
            <li><NavLink href="/">Inicio</NavLink></li>
            <li className="flex items-center"><ThemeToggle /></li>
            {session ? (
              <>
                <li><NavLink href="/agendar">Agendar</NavLink></li>
                <li><NavLink href="/mis-citas">Mis Citas</NavLink></li>
                {isAdmin && <li><NavLink href="/admin" accent>Admin</NavLink></li>}
                <li className="ml-2 pl-3 border-l border-card-border">
                  <span className="text-fg-secondary text-sm">{session.user?.name}</span>
                </li>
                <li>
                  <button onClick={() => signOut({ callbackUrl: "/" })} className="rounded-[var(--radius-md)] px-3 py-2 text-sm text-fg-muted hover:text-fg hover:bg-card-hover transition-colors min-h-[44px]">
                    Salir
                  </button>
                </li>
              </>
            ) : (
              <>
                <li><NavLink href="/login">Iniciar sesión</NavLink></li>
                <li className="ml-1">
                  <Link href="/registro" className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-primary px-4 py-2 text-sm font-semibold text-on-primary hover:bg-primary-hover transition-colors min-h-[44px]">
                    Registrarse
                  </Link>
                </li>
              </>
            )}
          </ul>

          <div className="md:hidden flex items-center gap-1">
            <ThemeToggle />
            <button
              onClick={() => setOpen(!open)}
              className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] hover:bg-card-hover transition-colors"
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={open}
            >
              <svg className="w-5 h-5 text-fg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" d="M4 7h16" />
                <path strokeLinecap="round" d="M4 12h16" />
                <path strokeLinecap="round" d="M4 17h16" />
              </svg>
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden border-t border-nav-border bg-nav-bg pb-4 pt-2">
            <ul className="space-y-1 px-2">
              <li><MobileLink href="/" onClick={() => setOpen(false)}>Inicio</MobileLink></li>
              {session ? (
                <>
                  <li><MobileLink href="/agendar" onClick={() => setOpen(false)}>Agendar</MobileLink></li>
                  <li><MobileLink href="/mis-citas" onClick={() => setOpen(false)}>Mis Citas</MobileLink></li>
                  {isAdmin && <li><MobileLink href="/admin" onClick={() => setOpen(false)}>Admin</MobileLink></li>}
                  <li className="border-t border-card-border mt-2 pt-2 px-4 py-2">
                    <span className="text-sm text-fg-secondary">{session.user?.name}</span>
                  </li>
                  <li>
                    <button onClick={() => { signOut({ callbackUrl: "/" }); setOpen(false); }} className="w-full text-left rounded-[var(--radius-md)] px-4 py-3 text-sm text-fg-muted hover:bg-card-hover transition-colors min-h-[44px]">
                      Cerrar sesión
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li><MobileLink href="/login" onClick={() => setOpen(false)}>Iniciar sesión</MobileLink></li>
                  <li className="px-2 pt-2">
                    <Link href="/registro" onClick={() => setOpen(false)} className="flex items-center justify-center rounded-[var(--radius-md)] bg-primary px-4 py-3 text-sm font-semibold text-on-primary hover:bg-primary-hover transition-colors min-h-[44px]">
                      Registrarse
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
}

function NavLink({ href, children, accent }: { href: string; children: React.ReactNode; accent?: boolean }) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={`rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-colors min-h-[44px] inline-flex items-center ${
        isActive
          ? "bg-primary-soft text-primary font-semibold border-b-2 border-primary"
          : accent
            ? "text-secondary hover:bg-secondary-soft"
            : "text-fg-secondary hover:text-fg hover:bg-card-hover"
      }`}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </Link>
  );
}

function MobileLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block rounded-[var(--radius-md)] px-4 py-3 text-sm font-medium transition-colors min-h-[44px] ${
        isActive
          ? "bg-primary-soft text-primary font-semibold"
          : "text-fg-secondary hover:bg-card-hover"
      }`}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </Link>
  );
}
