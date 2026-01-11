import { z } from 'zod'

export const areaOptions = [
    { value: 'DEVELOPMENT', label: 'Desarrollo' },
    { value: 'DESIGN', label: 'Diseño' },
    { value: 'MARKETING', label: 'Marketing' },
    { value: 'OPERATIONS', label: 'Operaciones' },
    { value: 'SALES', label: 'Ventas' },
    { value: 'DATA', label: 'Data' },
    { value: 'FINANCE', label: 'Finanzas' },
    { value: 'OTHER', label: 'Otro' },
] as const

export const englishLevelOptions = [
    { value: 'BASIC', label: 'Básico' },
    { value: 'INTERMEDIATE', label: 'Intermedio' },
    { value: 'ADVANCED', label: 'Avanzado' },
    { value: 'NATIVE', label: 'Nativo' },
] as const

export const areaValues = ['DEVELOPMENT', 'DESIGN', 'MARKETING', 'OPERATIONS', 'SALES', 'DATA', 'FINANCE', 'OTHER'] as const
export const englishLevelValues = ['BASIC', 'INTERMEDIATE', 'ADVANCED', 'NATIVE'] as const

export const memberFormSchema = z.object({
    fullName: z
        .string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100, 'El nombre es demasiado largo'),
    email: z
        .string()
        .email('Ingresa un email válido'),
    whatsapp: z
        .string()
        .min(10, 'Ingresa un número de WhatsApp válido')
        .max(20, 'Número demasiado largo'),
    linkedinUrl: z
        .string()
        .url('Ingresa una URL válida de LinkedIn')
        .refine(
            (url) => url.includes('linkedin.com'),
            'Debe ser una URL de LinkedIn'
        ),
    area: z.enum(areaValues, {
        message: 'Selecciona un área',
    }),
    currentRole: z
        .string()
        .min(2, 'Ingresa tu rol actual')
        .max(100, 'El rol es demasiado largo'),
    yearsExperience: z
        .number()
        .min(0, 'Los años de experiencia no pueden ser negativos')
        .max(50, 'Valor inválido'),
    englishLevel: z.enum(englishLevelValues, {
        message: 'Selecciona tu nivel de inglés',
    }),
    location: z
        .string()
        .min(2, 'Ingresa tu ciudad y país'),
    workPreference: z.enum(['REMOTE', 'HYBRID', 'ONSITE'], {
        message: 'Selecciona tu preferencia de trabajo',
    }),
    willingToRelocate: z.boolean().optional(),
})

export const workPreferenceOptions = [
    { value: 'REMOTE', label: 'Remoto 100%' },
    { value: 'HYBRID', label: 'Híbrido' },
    { value: 'ONSITE', label: 'Presencial' },
] as const

export const memberUpdateSchema = memberFormSchema.extend({
    notes: z.string().optional(),
    hiredDate: z.date().optional().nullable(),
    hiredCompany: z.string().optional().nullable(),
    hiredSalaryUsd: z.number().optional().nullable(),
})

export const referralSchema = z.object({
    companyName: z
        .string()
        .min(1, 'Ingresa el nombre de la empresa'),
    referralDate: z.date({
        message: 'Selecciona la fecha de referencia',
    }),
    notes: z.string().optional(),
})

export const stageSchema = z.object({
    name: z
        .string()
        .min(1, 'El nombre es requerido')
        .max(50, 'El nombre es demasiado largo'),
})

export const hiredInfoSchema = z.object({
    hiredCompany: z
        .string()
        .min(1, 'Ingresa el nombre de la empresa'),
    hiredDate: z.date({
        message: 'Selecciona la fecha de contratación',
    }),
    hiredSalaryUsd: z
        .number()
        .min(0, 'El salario no puede ser negativo'),
})

export type MemberFormData = z.infer<typeof memberFormSchema>
export type MemberUpdateData = z.infer<typeof memberUpdateSchema>
export type ReferralData = z.infer<typeof referralSchema>
export type StageData = z.infer<typeof stageSchema>
export type HiredInfoData = z.infer<typeof hiredInfoSchema>
