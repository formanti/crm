'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { createStage } from '@/actions/stages'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function AddStageButton() {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [name, setName] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleCreate = async () => {
        if (!name.trim()) {
            toast.error('Ingresa un nombre para la etapa')
            return
        }

        setIsLoading(true)
        try {
            const result = await createStage({ name: name.trim() })
            if (result.success) {
                toast.success('Etapa creada')
                setOpen(false)
                setName('')
                router.refresh()
            } else {
                toast.error(result.error || 'Error al crear etapa')
            }
        } catch (error) {
            toast.error('Error al crear etapa')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="flex-shrink-0 w-72 h-32 border-2 border-dashed border-[#e2e8f0] rounded-lg flex items-center justify-center gap-2 text-[#94a3b8] hover:border-[#94a3b8] hover:text-[#64748b] transition-colors cursor-pointer bg-transparent">
                    <Plus className="h-5 w-5" />
                    <span className="font-medium text-sm">Nueva Etapa</span>
                </button>
            </DialogTrigger>
            <DialogContent className="bg-white">
                <DialogHeader>
                    <DialogTitle className="text-[#0f172a]">Nueva Etapa</DialogTitle>
                    <DialogDescription className="text-[#64748b]">
                        Agrega una nueva etapa al pipeline
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <div className="space-y-2">
                        <Label htmlFor="stageName" className="text-sm font-medium text-[#0f172a]">
                            Nombre de la etapa
                        </Label>
                        <Input
                            id="stageName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Entrevista, Oferta, etc."
                            className="h-10 border-[#e2e8f0]"
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} className="border-[#e2e8f0]">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleCreate}
                        disabled={isLoading}
                        className="bg-[#1e293b] hover:bg-[#0f172a]"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creando...
                            </>
                        ) : (
                            'Crear Etapa'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
