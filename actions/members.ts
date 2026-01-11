'use server'

import { prisma } from '@/lib/prisma'
import { createServiceClient } from '@/lib/supabase/server'
import { memberFormSchema, memberUpdateSchema, type MemberFormData, type MemberUpdateData } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export async function createMember(data: MemberFormData & { cvFileUrl: string }) {
    try {
        // Validate data
        const validatedData = memberFormSchema.parse(data)

        // Check for duplicate email
        const existingMember = await prisma.member.findUnique({
            where: { email: validatedData.email },
        })

        if (existingMember) {
            return {
                success: false,
                error: 'Ya existe un miembro registrado con este email'
            }
        }

        // Get the first stage (Info Cargada)
        const firstStage = await prisma.stage.findFirst({
            where: { order: 1 },
        })

        if (!firstStage) {
            return {
                success: false,
                error: 'Error de configuración: no hay etapas definidas'
            }
        }

        // Create member
        const member = await prisma.member.create({
            data: {
                ...validatedData,
                cvFileUrl: data.cvFileUrl,
                stageId: firstStage.id,
            },
        })

        revalidatePath('/members')
        revalidatePath('/pipeline')

        return { success: true, member }
    } catch (error) {
        console.error('Error creating member:', error)
        return {
            success: false,
            error: 'Error al crear el miembro. Por favor intenta de nuevo.'
        }
    }
}

export async function updateMember(id: string, data: Partial<MemberUpdateData>) {
    try {
        const member = await prisma.member.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date(),
            },
        })

        revalidatePath('/members')
        revalidatePath(`/members/${id}`)
        revalidatePath('/pipeline')

        return { success: true, member }
    } catch (error) {
        console.error('Error updating member:', error)
        return {
            success: false,
            error: 'Error al actualizar el miembro'
        }
    }
}

export async function updateMemberStage(memberId: string, stageId: string, hiredInfo?: {
    hiredCompany: string
    hiredDate: Date
    hiredSalaryUsd: number
}) {
    try {
        const member = await prisma.member.update({
            where: { id: memberId },
            data: {
                stageId,
                ...(hiredInfo && {
                    hiredCompany: hiredInfo.hiredCompany,
                    hiredDate: hiredInfo.hiredDate,
                    hiredSalaryUsd: hiredInfo.hiredSalaryUsd,
                }),
                updatedAt: new Date(),
            },
        })

        revalidatePath('/members')
        revalidatePath('/pipeline')

        return { success: true, member }
    } catch (error) {
        console.error('Error updating member stage:', error)
        return {
            success: false,
            error: 'Error al actualizar la etapa'
        }
    }
}

export async function deleteMember(id: string) {
    try {
        // Get member to delete CV
        const member = await prisma.member.findUnique({
            where: { id },
        })

        if (member?.cvFileUrl) {
            // Delete CV from storage
            const supabase = await createServiceClient()
            const fileName = member.cvFileUrl.split('/').pop()
            if (fileName) {
                await supabase.storage.from('cvs').remove([fileName])
            }
        }

        await prisma.member.delete({
            where: { id },
        })

        revalidatePath('/members')
        revalidatePath('/pipeline')

        return { success: true }
    } catch (error) {
        console.error('Error deleting member:', error)
        return {
            success: false,
            error: 'Error al eliminar el miembro'
        }
    }
}

export async function getMember(id: string) {
    try {
        const member = await prisma.member.findUnique({
            where: { id },
            include: {
                stage: true,
                referrals: {
                    orderBy: { referralDate: 'desc' },
                },
            },
        })

        return { success: true, member }
    } catch (error) {
        console.error('Error getting member:', error)
        return {
            success: false,
            error: 'Error al obtener el miembro'
        }
    }
}

export async function getMembers(search?: string) {
    try {
        const members = await prisma.member.findMany({
            where: search
                ? {
                    OR: [
                        { fullName: { contains: search, mode: 'insensitive' } },
                        { email: { contains: search, mode: 'insensitive' } },
                    ],
                }
                : undefined,
            include: {
                stage: true,
            },
            orderBy: { createdAt: 'desc' },
        })

        return { success: true, members }
    } catch (error) {
        console.error('Error getting members:', error)
        return {
            success: false,
            error: 'Error al obtener los miembros',
            members: []
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

export async function uploadCV(formData: FormData) {
    try {
        const file = formData.get('file') as File
        if (!file) {
            return { success: false, error: 'No se proporcionó archivo' }
        }

        console.log('Uploading file:', file.name, 'type:', file.type, 'size:', file.size)

        // Validate file type - Only PDF
        if (file.type !== 'application/pdf') {
            return { success: false, error: 'Solo se permiten archivos PDF' }
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            return { success: false, error: 'El archivo no puede superar 10MB' }
        }

        const supabase = await createServiceClient()

        // Generate unique filename
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.pdf`

        // Convert File to ArrayBuffer then to Buffer for upload
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const { data, error } = await supabase.storage
            .from('cvs')
            .upload(fileName, buffer, {
                contentType: 'application/pdf',
                cacheControl: '3600',
                upsert: false,
            })

        if (error) {
            console.error('Storage error:', error)
            return { success: false, error: `Error al subir: ${error.message}` }
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('cvs')
            .getPublicUrl(fileName)

        return { success: true, url: publicUrl }
    } catch (error) {
        console.error('Error uploading CV:', error)
        return { success: false, error: 'Error al subir el CV' }
    }
}

export async function importMembers(membersData: any[]) {
    try {
        const stats = {
            total: membersData.length,
            created: 0,
            updated: 0,
            skipped: 0,
            errors: 0
        }

        // Get the default stage
        const firstStage = await prisma.stage.findFirst({
            where: { order: 1 },
        })

        if (!firstStage) {
            return {
                success: false,
                error: 'Error de configuración: no hay etapas definidas'
            }
        }

        for (const data of membersData) {
            try {
                // Quick validation of required fields
                if (!data.email || !data.fullName) {
                    stats.skipped++
                    continue
                }

                // Check existing member
                const existingMember = await prisma.member.findUnique({
                    where: { email: data.email },
                })

                if (existingMember) {
                    // Update existing
                    await prisma.member.update({
                        where: { id: existingMember.id },
                        data: {
                            fullName: data.fullName,
                            // Only update fields if provided and different? 
                            // For now, we update these basic fields if present
                            ...(data.whatsapp && { whatsapp: data.whatsapp }),
                            ...(data.linkedinUrl && { linkedinUrl: data.linkedinUrl }),
                            ...(data.role && { currentRole: data.role }),
                            // Preserve existing CV and Stage
                            updatedAt: new Date(),
                        }
                    })
                    stats.updated++
                } else {
                    // Create new
                    await prisma.member.create({
                        data: {
                            email: data.email.toString().trim(),
                            fullName: data.fullName.toString().trim(),
                            whatsapp: data.whatsapp?.toString().trim() || '',
                            linkedinUrl: data.linkedinUrl?.toString().trim() || '',
                            currentRole: data.role?.toString().trim() || 'Member',
                            area: 'OTHER', // Default
                            englishLevel: 'BASIC', // Default
                            yearsExperience: 0, // Default
                            cvFileUrl: '', // Initial empty
                            stageId: firstStage.id,
                        }
                    })
                    stats.created++
                }
            } catch (error) {
                console.error(`Error processing member ${data.email}:`, error)
                stats.errors++
            }
        }

        revalidatePath('/members')
        revalidatePath('/pipeline')

        return { success: true, stats }
    } catch (error) {
        console.error('Error importing members:', error)
        return {
            success: false,
            error: 'Error al procesar el archivo'
        }
    }
}

