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

export function StageColumn({ stage, members }: StageColumnProps) {
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [name, setName] = useState(stage.name)
    const [isSaving, setIsSaving] = useState(false)

    const { setNodeRef, isOver } = useDroppable({
        id: stage.id,
    })

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
            className={`
        flex-shrink-0 w-72 flex flex-col bg-[#f1f5f9] rounded-lg
        ${isOver ? 'ring-2 ring-[#3b82f6] ring-offset-2' : ''}
        transition-all
      `}
        >
            {/* Header */}
            <div className="p-3 border-b border-[#e2e8f0]">
                <div className="flex items-center justify-between">
                    {isEditing ? (
                        <div className="flex items-center gap-1.5 flex-1">
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-8 text-sm font-medium bg-white"
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
                                <span className="font-medium text-[#0f172a] text-sm">{stage.name}</span>
                                <span className="bg-white text-[#64748b] text-xs font-medium px-2 py-0.5 rounded">
                                    {members.length}
                                </span>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-white">
                                        <MoreHorizontal className="h-4 w-4 text-[#64748b]" />
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
            <div className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[200px]">
                <SortableContext items={members.map(m => m.id)} strategy={verticalListSortingStrategy}>
                    {members.map((member) => (
                        <MemberCard key={member.id} member={member} />
                    ))}
                </SortableContext>

                {members.length === 0 && (
                    <div className="text-center py-8 text-[#94a3b8] text-sm">
                        Arrastra miembros aquí
                    </div>
                )}
            </div>
        </div>
    )
}
