import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
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
        const otherArea = formData.get('otherArea') as string || undefined
        const currentRole = formData.get('currentRole') as string
        const yearsExperience = parseInt(formData.get('yearsExperience') as string) || 0
        const englishLevel = formData.get('englishLevel') as string
        const cvUrl = formData.get('cvUrl') as string
        const location = formData.get('location') as string
        const workPreference = formData.get('workPreference') as string
        const willingToRelocate = formData.get('willingToRelocate') === 'true'

        if (!cvUrl || cvUrl === 'null' || cvUrl === 'undefined') {
            return NextResponse.json(
                { success: false, error: 'CV URL is missing' },
                { status: 400 }
            )
        }

        // Validate data
        const validationResult = memberFormSchema.safeParse({
            fullName,
            email,
            whatsapp,
            linkedinUrl,
            area,
            otherArea,
            currentRole,
            yearsExperience,
            englishLevel,
            location,
            workPreference,
            willingToRelocate,
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
                otherArea: area === 'OTHER' ? otherArea : null,
                currentRole,
                yearsExperience,
                englishLevel: englishLevel as "BASIC" | "INTERMEDIATE" | "ADVANCED" | "NATIVE",
                location,
                workPreference: workPreference as "REMOTE" | "HYBRID" | "ONSITE",
                willingToRelocate,
                cvFileUrl: cvUrl,
                stage: {
                    connect: { id: firstStage.id }
                },
            },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error creating member:', error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Error interno del servidor',
                details: error
            },
            { status: 500 }
        )
    }
}
