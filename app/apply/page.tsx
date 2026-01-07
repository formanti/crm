'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { memberFormSchema, type MemberFormData, areaOptions, englishLevelOptions } from '@/lib/validations'
import { createMember, uploadCV } from '@/actions/members'
import { Loader2, Upload, Check, FileText, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

export default function ApplyPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [cvFile, setCvFile] = useState<File | null>(null)
    const [uploadingCV, setUploadingCV] = useState(false)

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
        watch,
    } = useForm<MemberFormData>({
        resolver: zodResolver(memberFormSchema),
        defaultValues: {
            yearsExperience: 0,
        },
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Validate file type
            if (file.type !== 'application/pdf') {
                toast.error('Solo se permiten archivos PDF')
                return
            }
            // Validate file size (10MB)
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
        setUploadingCV(true)

        try {
            // Upload CV first
            const formData = new FormData()
            formData.append('file', cvFile)
            const uploadResult = await uploadCV(formData)

            if (!uploadResult.success || !uploadResult.url) {
                toast.error(uploadResult.error || 'Error al subir el CV')
                return
            }

            setUploadingCV(false)

            // Create member
            const result = await createMember({
                ...data,
                cvFileUrl: uploadResult.url,
            })

            if (!result.success) {
                toast.error(result.error || 'Error al enviar la solicitud')
                return
            }

            setIsSuccess(true)
            toast.success('¡Solicitud enviada exitosamente!')
        } catch (error) {
            toast.error('Ocurrió un error. Por favor intenta de nuevo.')
        } finally {
            setIsSubmitting(false)
            setUploadingCV(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 p-4">
                <Card className="w-full max-w-md shadow-xl border-0 text-center">
                    <CardContent className="pt-12 pb-10">
                        <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                            ¡Solicitud Recibida!
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Gracias por tu interés en NEWAVE. Revisaremos tu información y te contactaremos pronto.
                        </p>
                        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-lg text-sm">
                            Te hemos agregado a nuestro pipeline de colocación. Pronto recibirás noticias de nosotros.
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-white font-bold text-2xl">N</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Únete a NEWAVE
                    </h1>
                    <p className="text-gray-600 max-w-md mx-auto">
                        Completa el siguiente formulario para unirte a nuestra comunidad y comenzar tu camino hacia el trabajo remoto internacional.
                    </p>
                </div>

                <Card className="shadow-xl border-0">
                    <CardHeader>
                        <CardTitle className="text-xl">Información de Aplicación</CardTitle>
                        <CardDescription>
                            Todos los campos son obligatorios
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Contact Section */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                                    Información de Contacto
                                </h3>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Nombre Completo</Label>
                                        <Input
                                            id="fullName"
                                            {...register('fullName')}
                                            placeholder="Juan Pérez"
                                            className="h-11"
                                        />
                                        {errors.fullName && (
                                            <p className="text-sm text-red-500">{errors.fullName.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            {...register('email')}
                                            placeholder="juan@email.com"
                                            className="h-11"
                                        />
                                        {errors.email && (
                                            <p className="text-sm text-red-500">{errors.email.message}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="whatsapp">WhatsApp (con código de país)</Label>
                                        <Input
                                            id="whatsapp"
                                            {...register('whatsapp')}
                                            placeholder="+52 55 1234 5678"
                                            className="h-11"
                                        />
                                        {errors.whatsapp && (
                                            <p className="text-sm text-red-500">{errors.whatsapp.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="linkedinUrl">URL de LinkedIn</Label>
                                        <Input
                                            id="linkedinUrl"
                                            {...register('linkedinUrl')}
                                            placeholder="https://linkedin.com/in/tu-perfil"
                                            className="h-11"
                                        />
                                        {errors.linkedinUrl && (
                                            <p className="text-sm text-red-500">{errors.linkedinUrl.message}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* CV Upload */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                                    Currículum
                                </h3>

                                <div className="space-y-2">
                                    <Label htmlFor="cv">CV (PDF, máx. 10MB)</Label>
                                    <div className="relative">
                                        <input
                                            id="cv"
                                            type="file"
                                            accept=".pdf"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="cv"
                                            className={`flex items-center justify-center gap-3 border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${cvFile
                                                ? 'border-emerald-300 bg-emerald-50'
                                                : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'
                                                }`}
                                        >
                                            {cvFile ? (
                                                <>
                                                    <FileText className="w-8 h-8 text-emerald-500" />
                                                    <div className="text-left">
                                                        <p className="font-medium text-gray-900">{cvFile.name}</p>
                                                        <p className="text-sm text-gray-500">
                                                            {(cvFile.size / 1024 / 1024).toFixed(2)} MB
                                                        </p>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="w-8 h-8 text-gray-400" />
                                                    <div className="text-left">
                                                        <p className="font-medium text-gray-700">
                                                            Arrastra tu archivo o haz clic para seleccionar
                                                        </p>
                                                        <p className="text-sm text-gray-500">PDF hasta 10MB</p>
                                                    </div>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Professional Section */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                                    Perfil Profesional
                                </h3>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="area">Área Profesional</Label>
                                        <Select onValueChange={(value) => setValue('area', value as MemberFormData['area'])}>
                                            <SelectTrigger className="h-11">
                                                <SelectValue placeholder="Selecciona un área" />
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
                                            <p className="text-sm text-red-500">{errors.area.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="currentRole">Rol Actual</Label>
                                        <Input
                                            id="currentRole"
                                            {...register('currentRole')}
                                            placeholder="Ej: Software Engineer"
                                            className="h-11"
                                        />
                                        {errors.currentRole && (
                                            <p className="text-sm text-red-500">{errors.currentRole.message}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="yearsExperience">Años de Experiencia</Label>
                                        <Input
                                            id="yearsExperience"
                                            type="number"
                                            min="0"
                                            max="50"
                                            {...register('yearsExperience', { valueAsNumber: true })}
                                            className="h-11"
                                        />
                                        {errors.yearsExperience && (
                                            <p className="text-sm text-red-500">{errors.yearsExperience.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="englishLevel">Nivel de Inglés</Label>
                                        <Select onValueChange={(value) => setValue('englishLevel', value as MemberFormData['englishLevel'])}>
                                            <SelectTrigger className="h-11">
                                                <SelectValue placeholder="Selecciona tu nivel" />
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
                                            <p className="text-sm text-red-500">{errors.englishLevel.message}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-lg font-medium"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        {uploadingCV ? 'Subiendo CV...' : 'Enviando solicitud...'}
                                    </>
                                ) : (
                                    <>
                                        Enviar Solicitud
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Al enviar este formulario, aceptas que procesemos tu información para fines de colocación laboral.
                </p>
            </div>
        </div>
    )
}
