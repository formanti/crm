'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { MemberCard } from './member-card'
import { updateStage, deleteStage } from '@/actions/stages'
import { MoreHorizontal, Pencil, Trash2, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import type { Stage, Member } from '@prisma/client'

interface StageColumnProps {
    stage: Stage
    members: Member[]
}

const stageColors: Record<string, { bg: string; border: string; header: string }> = {
    'info-cargada': { bg: 'bg-slate-50', border: 'border-slate-200', header: 'bg-slate-100' },
    'calificado': { bg: 'bg-blue-50', border: 'border-blue-200', header: 'bg-blue-100' },
    'referido': { bg: 'bg-amber-50', border: 'border-amber-200', header: 'bg-amber-100' },
    'contratado': { bg: 'bg-emerald-50', border: 'border-emerald-200', header: 'bg-emerald-100' },
}

export function StageColumn({ stage, members }: StageColumnProps) {
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [name, setName] = useState(stage.name)
    const [isSaving, setIsSaving] = useState(false)

    const { setNodeRef, isOver } = useDroppable({
        id: stage.id,
    })

    const colors = stageColors[stage.id] || { bg: 'bg-gray-50', border: 'border-gray-200', header: 'bg-gray-100' }

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error('El nombre no puede estar vacío')
            return
        }

        setIsSaving(true)
        try {
            const result = await updateStage(stage.id, { name: name.trim() })
            if (result.success) {
                setIsEditing(false)
                router.refresh()
            } else {
                toast.error(result.error || 'Error')
            }
        } catch (error) {
            toast.error('Error')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async () => {
        if (members.length > 0) {
            toast.error('No puedes eliminar una etapa con miembros')
            return
        }

        try {
            const result = await deleteStage(stage.id)
            if (result.success) {
                toast.success('Etapa eliminada')
                router.refresh()
            } else {
                toast.error(result.error || 'Error')
            }
        } catch (error) {
            toast.error('Error')
        }
    }

    return (
        <div
            ref={setNodeRef}
            className={`flex-shrink-0 w-80 flex flex-col rounded-xl border ${colors.border} ${colors.bg} ${isOver ? 'ring-2 ring-indigo-400 ring-offset-2' : ''
                } transition-all`}
        >
            {/* Header */}
            <div className={`p-4 rounded-t-xl ${colors.header}`}>
                <div className="flex items-center justify-between">
                    {isEditing ? (
                        <div className="flex items-center gap-2 flex-1">
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-8 text-sm font-semibold"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSave()
                                    if (e.key === 'Escape') {
                                        setName(stage.name)
                                        setIsEditing(false)
                                    }
                                }}
                            />
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={handleSave} disabled={isSaving}>
                                <Check className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => { setName(stage.name); setIsEditing(false) }}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-800">{stage.name}</h3>
                                <span className="bg-white/50 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
                                    {members.length}
                                </span>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                                        <Pencil className="h-4 w-4 mr-2" />
                                        Renombrar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={handleDelete}
                                        className="text-red-600 focus:text-red-600"
                                        disabled={members.length > 0}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Eliminar
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    )}
                </div>
            </div>

            {/* Cards */}
            <div className="flex-1 p-3 space-y-3 overflow-y-auto min-h-[200px]">
                <SortableContext items={members.map(m => m.id)} strategy={verticalListSortingStrategy}>
                    {members.map((member) => (
                        <MemberCard key={member.id} member={member} />
                    ))}
                </SortableContext>

                {members.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                        Arrastra miembros aquí
                    </div>
                )}
            </div>
        </div>
    )
}
