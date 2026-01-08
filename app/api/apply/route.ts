import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServiceClient } from '@/lib/supabase/server'
import { memberFormSchema } from '@/lib/validations'

// Force Node.js runtime for Prisma compatibility
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()

        // Extract form fields
        const fullName = formData.get('fullName') as string
        const email = formData.get('email') as string
        const whatsapp = formData.get('whatsapp') as string
        const linkedinUrl = formData.get('linkedinUrl') as string
        const area = formData.get('area') as string
        const currentRole = formData.get('currentRole') as string
        const yearsExperience = parseInt(formData.get('yearsExperience') as string) || 0
        const englishLevel = formData.get('englishLevel') as string
        const cvFile = formData.get('cv') as File

        // Validate data
        const validationResult = memberFormSchema.safeParse({
            fullName,
            email,
            whatsapp,
            linkedinUrl,
            area,
            currentRole,
            yearsExperience,
            englishLevel,
        })

        if (!validationResult.success) {
            return NextResponse.json(
                { success: false, error: 'Datos inválidos' },
                { status: 400 }
            )
        }

        // Check for duplicate email
        const existingMember = await prisma.member.findUnique({
            where: { email },
        })

        if (existingMember) {
            return NextResponse.json(
                { success: false, error: 'Ya existe un miembro con este email' },
                { status: 400 }
            )
        }

        // Upload CV to Supabase Storage
        let cvFileUrl = ''
        if (cvFile && cvFile.size > 0) {
            const supabase = await createServiceClient()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.pdf`
            const arrayBuffer = await cvFile.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)

            const { error: uploadError } = await supabase.storage
                .from('cvs')
                .upload(fileName, buffer, {
                    contentType: 'application/pdf',
                    cacheControl: '3600',
                    upsert: false,
                })

            if (uploadError) {
                console.error('Upload error:', uploadError)
                return NextResponse.json(
                    { success: false, error: 'Error al subir el CV' },
                    { status: 500 }
                )
            }

            const { data: { publicUrl } } = supabase.storage
                .from('cvs')
                .getPublicUrl(fileName)

            cvFileUrl = publicUrl
        }

        // Get the first stage
        const firstStage = await prisma.stage.findFirst({
            where: { order: 1 },
        })

        if (!firstStage) {
            return NextResponse.json(
                { success: false, error: 'No hay etapas configuradas' },
                { status: 500 }
            )
        }

        // Create member
        await prisma.member.create({
            data: {
                fullName,
                email,
                whatsapp,
                linkedinUrl,
                area: area as "DEVELOPMENT" | "DESIGN" | "MARKETING" | "OPERATIONS" | "SALES" | "DATA" | "FINANCE" | "OTHER",
                currentRole,
                yearsExperience,
                englishLevel: englishLevel as "BASIC" | "INTERMEDIATE" | "ADVANCED" | "NATIVE",
                cvFileUrl,
                stageId: firstStage.id,
            },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error creating member:', error)
        return NextResponse.json(
            { success: false, error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}
