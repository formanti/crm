'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { memberFormSchema, areaOptions, englishLevelOptions, workPreferenceOptions, type MemberFormData } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Toaster } from 'sonner'
import { Loader2, Upload, CheckCircle, FileText, X } from 'lucide-react'

export default function ApplyPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [cvFile, setCvFile] = useState<File | null>(null)
    const [isSuccess, setIsSuccess] = useState(false)

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<MemberFormData>({
        resolver: zodResolver(memberFormSchema),
        defaultValues: {
            fullName: '',
            email: '',
            whatsapp: '',
            linkedinUrl: '',
            currentRole: '',
            yearsExperience: 0,
            location: '',
            workPreference: 'REMOTE',
            willingToRelocate: false,
        }
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.type !== 'application/pdf') {
                toast.error('Solo se permiten archivos PDF')
                return
            }
            if (file.size > 10 * 1024 * 1024) {
                toast.error('El archivo no puede superar 10MB')
                return
            }
            setCvFile(file)
        }
    }

    const onSubmit = async (data: MemberFormData) => {
        if (!cvFile) {
            toast.error('Por favor sube tu CV')
            return
        }

        setIsSubmitting(true)

        try {
            // Upload to Supabase Storage client-side
            const supabase = createClient()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.pdf`

            const { error: uploadError } = await supabase.storage
                .from('cvs')
                .upload(fileName, cvFile, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (uploadError) {
                console.error('Upload error:', uploadError)
                toast.error('Error al subir el archivo. Intenta de nuevo.')
                setIsSubmitting(false)
                return
            }

            const { data: { publicUrl } } = supabase.storage
                .from('cvs')
                .getPublicUrl(fileName)

            // Send data to API with the CV URL
            const formData = new FormData()
            formData.append('fullName', data.fullName)
            formData.append('email', data.email)
            formData.append('whatsapp', data.whatsapp)
            formData.append('linkedinUrl', data.linkedinUrl || '')
            formData.append('area', data.area)
            formData.append('currentRole', data.currentRole)
            formData.append('yearsExperience', String(data.yearsExperience || 0))
            formData.append('englishLevel', data.englishLevel)
            formData.append('location', data.location)
            formData.append('workPreference', data.workPreference)
            formData.append('willingToRelocate', String(data.willingToRelocate))
            formData.append('cvUrl', publicUrl) // Send URL instead of file

            const response = await fetch('/api/apply', {
                method: 'POST',
                body: formData,
            })

            const result = await response.json()

            if (result.success) {
                setIsSuccess(true)
            } else {
                toast.error(result.error || 'Error al enviar la aplicación')
            }
        } catch (error) {
            console.error('Submission error:', error)
            toast.error('Error al procesar la solicitud')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center">
                    <div className="bg-white rounded-lg border border-[#e2e8f0] p-10 shadow-sm">
                        <div className="w-16 h-16 bg-[#dcfce7] rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="h-8 w-8 text-[#22c55e]" />
                        </div>
                        <h2 className="text-2xl font-semibold text-[#0f172a] mb-3">
                            ¡Aplicación enviada!
                        </h2>
                        <p className="text-[#64748b]">
                            Hemos recibido tu información correctamente. Nos pondremos en contacto contigo pronto.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <Image
                        src="/logo.png"
                        alt="Nomad District"
                        width={180}
                        height={36}
                        className="mx-auto mb-6"
                    />
                    <h1 className="text-3xl font-semibold text-[#0f172a]">
                        Únete a la comunidad
                    </h1>
                    <p className="text-[#64748b] mt-2">
                        Completa el formulario para aplicar
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-sm">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {/* Personal Info Section */}
                        <div className="p-8 border-b border-[#e2e8f0]">
                            <h2 className="text-lg font-semibold text-[#0f172a] mb-6">
                                Información Personal
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="md:col-span-2">
                                    <Label htmlFor="fullName" className="text-sm font-medium text-[#0f172a]">
                                        Nombre completo
                                    </Label>
                                    <Input
                                        id="fullName"
                                        {...register('fullName')}
                                        placeholder="Tu nombre"
                                        className="mt-1.5 h-11 bg-white border-[#e2e8f0] rounded-lg"
                                    />
                                    {errors.fullName && (
                                        <p className="text-sm text-red-500 mt-1">{errors.fullName.message}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="email" className="text-sm font-medium text-[#0f172a]">
                                        Correo electrónico
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        {...register('email')}
                                        placeholder="tu@email.com"
                                        className="mt-1.5 h-11 bg-white border-[#e2e8f0] rounded-lg"
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="whatsapp" className="text-sm font-medium text-[#0f172a]">
                                        WhatsApp
                                    </Label>
                                    <Input
                                        id="whatsapp"
                                        {...register('whatsapp')}
                                        placeholder="+52 1234567890"
                                        className="mt-1.5 h-11 bg-white border-[#e2e8f0] rounded-lg"
                                    />
                                    {errors.whatsapp && (
                                        <p className="text-sm text-red-500 mt-1">{errors.whatsapp.message}</p>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <Label htmlFor="linkedinUrl" className="text-sm font-medium text-[#0f172a]">
                                        LinkedIn
                                    </Label>
                                    <Input
                                        id="linkedinUrl"
                                        {...register('linkedinUrl')}
                                        placeholder="https://linkedin.com/in/tu-perfil"
                                        className="mt-1.5 h-11 bg-white border-[#e2e8f0] rounded-lg"
                                    />
                                    {errors.linkedinUrl && (
                                        <p className="text-sm text-red-500 mt-1">{errors.linkedinUrl.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Professional Info Section */}
                        <div className="p-8 border-b border-[#e2e8f0]">
                            <h2 className="text-lg font-semibold text-[#0f172a] mb-6">
                                Perfil Profesional
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <Label className="text-sm font-medium text-[#0f172a]">
                                        Área
                                    </Label>
                                    <Select onValueChange={(value) => setValue('area', value as MemberFormData['area'])}>
                                        <SelectTrigger className="mt-1.5 h-11 bg-white border-[#e2e8f0] rounded-lg">
                                            <SelectValue placeholder="Selecciona" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {areaOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.area && (
                                        <p className="text-sm text-red-500 mt-1">{errors.area.message}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="currentRole" className="text-sm font-medium text-[#0f172a]">
                                        Rol actual
                                    </Label>
                                    <Input
                                        id="currentRole"
                                        {...register('currentRole')}
                                        placeholder="Ej: Product Designer"
                                        className="mt-1.5 h-11 bg-white border-[#e2e8f0] rounded-lg"
                                    />
                                    {errors.currentRole && (
                                        <p className="text-sm text-red-500 mt-1">{errors.currentRole.message}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="yearsExperience" className="text-sm font-medium text-[#0f172a]">
                                        Años de experiencia
                                    </Label>
                                    <Input
                                        id="yearsExperience"
                                        type="number"
                                        min="0"
                                        {...register('yearsExperience', { valueAsNumber: true })}
                                        placeholder="5"
                                        className="mt-1.5 h-11 bg-white border-[#e2e8f0] rounded-lg"
                                    />
                                    {errors.yearsExperience && (
                                        <p className="text-sm text-red-500 mt-1">{errors.yearsExperience.message}</p>
                                    )}
                                </div>

                                <div>
                                    <Label className="text-sm font-medium text-[#0f172a]">
                                        Nivel de inglés
                                    </Label>
                                    <Select onValueChange={(value) => setValue('englishLevel', value as MemberFormData['englishLevel'])}>
                                        <SelectTrigger className="mt-1.5 h-11 bg-white border-[#e2e8f0] rounded-lg">
                                            <SelectValue placeholder="Selecciona" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {englishLevelOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.englishLevel && (
                                        <p className="text-sm text-red-500 mt-1">{errors.englishLevel.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Location & Preferences Section */}
                        <div className="p-8 border-b border-[#e2e8f0]">
                            <h2 className="text-lg font-semibold text-[#0f172a] mb-6">
                                Ubicación y Preferencias
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="md:col-span-2">
                                    <Label htmlFor="location" className="text-sm font-medium text-[#0f172a]">
                                        ¿Dónde vives actualmente? (Ciudad, País)
                                    </Label>
                                    <Input
                                        id="location"
                                        {...register('location')}
                                        placeholder="Ej: Ciudad de México, México"
                                        className="mt-1.5 h-11 bg-white border-[#e2e8f0] rounded-lg"
                                    />
                                    {errors.location && (
                                        <p className="text-sm text-red-500 mt-1">{errors.location.message}</p>
                                    )}
                                </div>

                                <div>
                                    <Label className="text-sm font-medium text-[#0f172a]">
                                        Preferencia de trabajo
                                    </Label>
                                    <Select onValueChange={(value) => setValue('workPreference', value as MemberFormData['workPreference'])}>
                                        <SelectTrigger className="mt-1.5 h-11 bg-white border-[#e2e8f0] rounded-lg">
                                            <SelectValue placeholder="Selecciona" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {workPreferenceOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.workPreference && (
                                        <p className="text-sm text-red-500 mt-1">{errors.workPreference.message}</p>
                                    )}
                                </div>

                                {(watch('workPreference') === 'HYBRID' || watch('workPreference') === 'ONSITE') && (
                                    <div className="flex items-center h-full pt-8">
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id="willingToRelocate"
                                                {...register('willingToRelocate')}
                                                className="h-4 w-4 rounded border-gray-300 text-[#1e293b] focus:ring-[#1e293b]"
                                            />
                                            <Label htmlFor="willingToRelocate" className="text-sm font-medium text-[#0f172a]">
                                                ¿Estarías dispuesto a mudarte a CDMX?
                                            </Label>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* CV Upload Section */}
                        <div className="p-8 border-b border-[#e2e8f0]">
                            <h2 className="text-lg font-semibold text-[#0f172a] mb-6">
                                Documento
                            </h2>

                            <div>
                                <Label className="text-sm font-medium text-[#0f172a]">
                                    CV (PDF, máx. 10MB)
                                </Label>
                                <div className="mt-1.5">
                                    <input
                                        id="cv"
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />

                                    {cvFile ? (
                                        <div className="flex items-center justify-between p-4 bg-[#f1f5f9] border border-[#e2e8f0] rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-5 w-5 text-[#64748b]" />
                                                <span className="text-sm font-medium text-[#0f172a]">{cvFile.name}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setCvFile(null)}
                                                className="text-[#64748b] hover:text-[#0f172a]"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label
                                            htmlFor="cv"
                                            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#e2e8f0] rounded-lg cursor-pointer hover:border-[#94a3b8] transition-colors"
                                        >
                                            <Upload className="h-8 w-8 text-[#94a3b8] mb-3" />
                                            <p className="text-sm font-medium text-[#64748b]">
                                                Haz clic para subir tu CV
                                            </p>
                                            <p className="text-xs text-[#94a3b8] mt-1">PDF hasta 10MB</p>
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="p-8">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-12 bg-[#1e293b] hover:bg-[#0f172a] text-white font-medium rounded-lg transition-colors"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    'Enviar aplicación'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-[#94a3b8] mt-8">
                    © 2024 Nomad District. Todos los derechos reservados. (v2.2)
                </p>
            </div>
        </div>
    )
}
