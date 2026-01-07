import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { getUser, logout } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Users, Columns, LogOut, Home, Bell, Settings, HelpCircle } from 'lucide-react'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            {/* Sidebar - Dark Slate */}
            <aside className="fixed left-0 top-0 z-40 h-screen w-60 bg-[#1a1f2e] flex flex-col">
                {/* Logo */}
                <div className="flex items-center px-5 py-5 border-b border-[#2d3748]">
                    <Image
                        src="/logo.png"
                        alt="Nomad District"
                        width={160}
                        height={32}
                        className="brightness-0 invert"
                    />
                </div>

                {/* Main Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    <NavItem href="/members" icon={Users} label="Miembros" />
                    <NavItem href="/pipeline" icon={Columns} label="Pipeline" />
                </nav>

                {/* Bottom Section */}
                <div className="px-3 py-4 border-t border-[#2d3748] space-y-1">
                    <NavItem href="#" icon={Bell} label="Notificaciones" badge="10" />
                    <NavItem href="#" icon={HelpCircle} label="Soporte" />
                    <NavItem href="#" icon={Settings} label="Configuración" />
                </div>

                {/* User Section */}
                <div className="p-3 border-t border-[#2d3748]">
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#2d3748] transition-colors">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                                {user.email?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                                {user.email?.split('@')[0]}
                            </p>
                            <p className="text-xs text-slate-400 truncate">@{user.email?.split('@')[0]}</p>
                        </div>
                        <form action={logout}>
                            <button type="submit" className="text-slate-400 hover:text-white transition-colors">
                                <LogOut className="h-4 w-4" />
                            </button>
                        </form>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-60 min-h-screen">
                {children}
            </main>
        </div>
    )
}

function NavItem({
    href,
    icon: Icon,
    label,
    badge,
    active = false
}: {
    href: string
    icon: React.ComponentType<{ className?: string }>
    label: string
    badge?: string
    active?: boolean
}) {
    return (
        <Link href={href}>
            <div className={`
        flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer
        ${active
                    ? 'bg-[#2d3748] text-white'
                    : 'text-slate-300 hover:bg-[#2d3748] hover:text-white'
                }
      `}>
                <Icon className="h-5 w-5" />
                <span className="flex-1 text-sm font-medium">{label}</span>
                {badge && (
                    <span className="bg-[#2d3748] text-slate-300 text-xs px-2 py-0.5 rounded">
                        {badge}
                    </span>
                )}
            </div>
        </Link>
    )
}
