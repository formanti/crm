'use server'

import { prisma } from '@/lib/prisma'
import { referralSchema, type ReferralData } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export async function createReferral(memberId: string, data: ReferralData) {
    try {
        const validatedData = referralSchema.parse(data)

        const referral = await prisma.referral.create({
            data: {
                memberId,
                companyName: validatedData.companyName,
                referralDate: validatedData.referralDate,
                notes: validatedData.notes,
            },
        })

        revalidatePath(`/members/${memberId}`)
        revalidatePath('/members')

        return { success: true, referral }
    } catch (error) {
        console.error('Error creating referral:', error)
        return {
            success: false,
            error: 'Error al crear la referencia'
        }
    }
}

export async function updateReferral(id: string, data: ReferralData) {
    try {
        const validatedData = referralSchema.parse(data)

        const referral = await prisma.referral.update({
            where: { id },
            data: {
                companyName: validatedData.companyName,
                referralDate: validatedData.referralDate,
                notes: validatedData.notes,
            },
        })

        revalidatePath(`/members/${referral.memberId}`)

        return { success: true, referral }
    } catch (error) {
        console.error('Error updating referral:', error)
        return {
            success: false,
            error: 'Error al actualizar la referencia'
        }
    }
}

export async function deleteReferral(id: string) {
    try {
        const referral = await prisma.referral.delete({
            where: { id },
        })

        revalidatePath(`/members/${referral.memberId}`)

        return { success: true }
    } catch (error) {
        console.error('Error deleting referral:', error)
        return {
            success: false,
            error: 'Error al eliminar la referencia'
        }
    }
}

export async function getReferrals(memberId: string) {
    try {
        const referrals = await prisma.referral.findMany({
            where: { memberId },
            orderBy: { referralDate: 'desc' },
        })

        return { success: true, referrals }
    } catch (error) {
        console.error('Error getting referrals:', error)
        return {
            success: false,
            error: 'Error al obtener las referencias',
            referrals: []
        }
    }
}
