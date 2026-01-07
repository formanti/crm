'use client'

import { useState } from 'react'
import Image from 'next/image'
import { login } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const result = await login(email, password)
            if (!result.success) {
                toast.error(result.error || 'Error al iniciar sesión')
            }
        } catch (error) {
            toast.error('Error al iniciar sesión')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-10">
                    <Image
                        src="/logo.png"
                        alt="Nomad District"
                        width={200}
                        height={40}
                        className="mx-auto"
                    />
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-lg border border-[#e2e8f0] p-8 shadow-sm">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-semibold text-[#0f172a]">
                            Iniciar sesión
                        </h1>
                        <p className="text-[#64748b] mt-2 text-sm">
                            Accede al CRM de Nomad District
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[#0f172a] text-sm font-medium">
                                Correo electrónico
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                                required
                                className="h-11 bg-white border-[#e2e8f0] focus:border-[#1e293b] focus:ring-[#1e293b] rounded-lg"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-[#0f172a] text-sm font-medium">
                                Contraseña
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="h-11 bg-white border-[#e2e8f0] focus:border-[#1e293b] focus:ring-[#1e293b] rounded-lg"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-11 bg-[#1e293b] hover:bg-[#0f172a] text-white font-medium rounded-lg transition-colors"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Entrando...
                                </>
                            ) : (
                                'Entrar'
                            )}
                        </Button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-[#94a3b8] text-sm mt-6">
                    © 2024 Nomad District. Todos los derechos reservados.
                </p>
            </div>
        </div>
    )
}
