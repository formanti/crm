'use server'

import { prisma } from '@/lib/prisma'
import { stageSchema, type StageData } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export async function getStages() {
    try {
        const stages = await prisma.stage.findMany({
            orderBy: { order: 'asc' },
            include: {
                _count: {
                    select: { members: true },
                },
            },
        })

        return { success: true, stages }
    } catch (error) {
        console.error('Error getting stages:', error)
        return {
            success: false,
            error: 'Error al obtener las etapas',
            stages: []
        }
    }
}

export async function getMembersByStage() {
    try {
        const stages = await prisma.stage.findMany({
            orderBy: { order: 'asc' },
            include: {
                members: {
                    orderBy: { updatedAt: 'desc' },
                },
            },
        })

        return { success: true, stages }
    } catch (error) {
        console.error('Error getting members by stage:', error)
        return {
            success: false,
            error: 'Error al obtener el pipeline',
            stages: []
        }
    }
}

export async function createStage(data: StageData) {
    try {
        const validatedData = stageSchema.parse(data)

        // Get the highest order
        const maxOrder = await prisma.stage.aggregate({
            _max: { order: true },
        })

        const stage = await prisma.stage.create({
            data: {
                name: validatedData.name,
                order: (maxOrder._max.order ?? 0) + 1,
            },
        })

        revalidatePath('/pipeline')

        return { success: true, stage }
    } catch (error) {
        console.error('Error creating stage:', error)
        return {
            success: false,
            error: 'Error al crear la etapa'
        }
    }
}

export async function updateStage(id: string, data: StageData) {
    try {
        const validatedData = stageSchema.parse(data)

        const stage = await prisma.stage.update({
            where: { id },
            data: { name: validatedData.name },
        })

        revalidatePath('/pipeline')
        revalidatePath('/members')

        return { success: true, stage }
    } catch (error) {
        console.error('Error updating stage:', error)
        return {
            success: false,
            error: 'Error al actualizar la etapa'
        }
    }
}

export async function deleteStage(id: string) {
    try {
        // Check if stage has members
        const memberCount = await prisma.member.count({
            where: { stageId: id },
        })

        if (memberCount > 0) {
            return {
                success: false,
                error: 'No puedes eliminar una etapa que tiene miembros'
            }
        }

        await prisma.stage.delete({
            where: { id },
        })

        revalidatePath('/pipeline')

        return { success: true }
    } catch (error) {
        console.error('Error deleting stage:', error)
        return {
            success: false,
            error: 'Error al eliminar la etapa'
        }
    }
}

export async function reorderStages(stageIds: string[]) {
    try {
        // Update each stage with its new order
        await Promise.all(
            stageIds.map((id, index) =>
                prisma.stage.update({
                    where: { id },
                    data: { order: index + 1 },
                })
            )
        )

        revalidatePath('/pipeline')

        return { success: true }
    } catch (error) {
        console.error('Error reordering stages:', error)
        return {
            success: false,
            error: 'Error al reordenar las etapas'
        }
    }
}
