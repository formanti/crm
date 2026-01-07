import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUser, logout } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Users, Columns, LogOut, Settings } from 'lucide-react'

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
        <div className="min-h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-slate-200 shadow-sm">
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-lg">N</span>
                        </div>
                        <span className="font-bold text-xl text-gray-900">NEWAVE</span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2">
                        <Link href="/members">
                            <Button variant="ghost" className="w-full justify-start gap-3 h-11 hover:bg-indigo-50 hover:text-indigo-600">
                                <Users className="h-5 w-5" />
                                Miembros
                            </Button>
                        </Link>
                        <Link href="/pipeline">
                            <Button variant="ghost" className="w-full justify-start gap-3 h-11 hover:bg-indigo-50 hover:text-indigo-600">
                                <Columns className="h-5 w-5" />
                                Pipeline
                            </Button>
                        </Link>
                    </nav>

                    {/* User Section */}
                    <div className="p-4 border-t border-slate-100">
                        <div className="flex items-center gap-3 px-3 py-2 mb-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                    {user.email?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {user.email}
                                </p>
                                <p className="text-xs text-gray-500">Admin</p>
                            </div>
                        </div>
                        <form action={logout}>
                            <Button variant="ghost" className="w-full justify-start gap-3 text-gray-500 hover:text-red-600 hover:bg-red-50">
                                <LogOut className="h-4 w-4" />
                                Cerrar sesión
                            </Button>
                        </form>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 min-h-screen">
                {children}
            </main>
        </div>
    )
}
