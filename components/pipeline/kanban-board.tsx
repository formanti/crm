'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragEndEvent,
    type DragOverEvent,
} from '@dnd-kit/core'
import {
    SortableContext,
    horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import { StageColumn } from './stage-column'
import { MemberCard } from './member-card'
import { HiredModal } from './hired-modal'
import { AddStageButton } from './add-stage-button'
import { updateMemberStage } from '@/actions/members'
import { reorderStages } from '@/actions/stages'
import { toast } from 'sonner'
import type { Stage, Member } from '@prisma/client'

type StageWithMembers = Stage & { members: Member[] }

interface KanbanBoardProps {
    stages: StageWithMembers[]
}

export function KanbanBoard({ stages: initialStages }: KanbanBoardProps) {
    const router = useRouter()
    const [stages, setStages] = useState(initialStages)
    const [activeId, setActiveId] = useState<string | null>(null)
    const [activeMember, setActiveMember] = useState<Member | null>(null)
    const [hiredModalOpen, setHiredModalOpen] = useState(false)
    const [pendingMove, setPendingMove] = useState<{ memberId: string; stageId: string } | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor)
    )

    const findStageByMemberId = (memberId: string) => {
        return stages.find(stage => stage.members.some(m => m.id === memberId))
    }

    const findMemberById = (memberId: string) => {
        for (const stage of stages) {
            const member = stage.members.find(m => m.id === memberId)
            if (member) return member
        }
        return null
    }

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event
        setActiveId(active.id as string)
        const member = findMemberById(active.id as string)
        setActiveMember(member)
    }

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event
        if (!over) return

        const activeId = active.id as string
        const overId = over.id as string

        const activeStage = findStageByMemberId(activeId)
        let overStage = stages.find(s => s.id === overId)

        // If overId is a member, find its stage
        if (!overStage) {
            overStage = findStageByMemberId(overId)
        }

        if (!activeStage || !overStage || activeStage.id === overStage.id) return

        // Move member to new stage (visual only)
        setStages(prev => {
            const newStages = prev.map(stage => ({
                ...stage,
                members: [...stage.members],
            }))

            const fromStageIndex = newStages.findIndex(s => s.id === activeStage.id)
            const toStageIndex = newStages.findIndex(s => s.id === overStage!.id)

            const memberIndex = newStages[fromStageIndex].members.findIndex(m => m.id === activeId)
            const [member] = newStages[fromStageIndex].members.splice(memberIndex, 1)
            newStages[toStageIndex].members.push(member)

            return newStages
        })
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        setActiveId(null)
        setActiveMember(null)

        if (!over) return

        const memberId = active.id as string
        const overId = over.id as string

        // Find the target stage
        let targetStage = stages.find(s => s.id === overId)
        if (!targetStage) {
            targetStage = findStageByMemberId(overId)
        }

        if (!targetStage) return

        // Check if moving to "Contratado" stage
        const isContratado = targetStage.id === 'contratado' || targetStage.name.toLowerCase() === 'contratado'

        if (isContratado) {
            setPendingMove({ memberId, stageId: targetStage.id })
            setHiredModalOpen(true)
        } else {
            // Direct update
            try {
                const result = await updateMemberStage(memberId, targetStage.id)
                if (!result.success) {
                    toast.error(result.error || 'Error al mover miembro')
                    router.refresh()
                }
            } catch (error) {
                toast.error('Error al actualizar')
                router.refresh()
            }
        }
    }

    const handleHiredConfirm = async (data: { hiredCompany: string; hiredDate: Date; hiredSalaryUsd: number }) => {
        if (!pendingMove) return

        try {
            const result = await updateMemberStage(pendingMove.memberId, pendingMove.stageId, data)
            if (result.success) {
                toast.success('¡Miembro marcado como contratado!')
            } else {
                toast.error(result.error || 'Error')
                router.refresh()
            }
        } catch (error) {
            toast.error('Error')
            router.refresh()
        } finally {
            setHiredModalOpen(false)
            setPendingMove(null)
        }
    }

    const handleHiredCancel = () => {
        setHiredModalOpen(false)
        setPendingMove(null)
        router.refresh()
    }

    return (
        <>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex gap-6 h-full overflow-x-auto pb-4">
                    <SortableContext items={stages.map(s => s.id)} strategy={horizontalListSortingStrategy}>
                        {stages.map((stage) => (
                            <StageColumn
                                key={stage.id}
                                stage={stage}
                                members={stage.members}
                            />
                        ))}
                    </SortableContext>

                    <AddStageButton />
                </div>

                <DragOverlay>
                    {activeId && activeMember ? (
                        <MemberCard member={activeMember} isDragging />
                    ) : null}
                </DragOverlay>
            </DndContext>

            <HiredModal
                open={hiredModalOpen}
                onConfirm={handleHiredConfirm}
                onCancel={handleHiredCancel}
            />
        </>
    )
}
