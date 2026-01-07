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
                <button className="flex-shrink-0 w-80 h-32 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-2 text-gray-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors cursor-pointer">
                    <Plus className="h-5 w-5" />
                    <span className="font-medium">Nueva Etapa</span>
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Nueva Etapa</DialogTitle>
                    <DialogDescription>
                        Agrega una nueva etapa al pipeline de colocación
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <div className="space-y-2">
                        <Label htmlFor="stageName">Nombre de la etapa</Label>
                        <Input
                            id="stageName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Entrevista, Oferta, etc."
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleCreate} disabled={isLoading}>
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
