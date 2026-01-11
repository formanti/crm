'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { memberFormSchema, type MemberFormData, areaOptions, englishLevelOptions, workPreferenceOptions } from '@/lib/validations'
import { createMember, uploadCV } from '@/actions/members'
import { Plus, Loader2, Upload, FileText } from 'lucide-react'
import { toast } from 'sonner'

export function AddMemberButton() {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [cvFile, setCvFile] = useState<File | null>(null)

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<MemberFormData>({
        resolver: zodResolver(memberFormSchema),
        defaultValues: {
            yearsExperience: 0,
            location: '',
            workPreference: 'REMOTE',
            willingToRelocate: false,
        },
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
            toast.error('Por favor sube el CV del miembro')
            return
        }

        setIsSubmitting(true)

        try {
            // Upload CV
            const formData = new FormData()
            formData.append('file', cvFile)
            const uploadResult = await uploadCV(formData)

            if (!uploadResult.success || !uploadResult.url) {
                toast.error(uploadResult.error || 'Error al subir el CV')
                return
            }

            // Create member
            const result = await createMember({
                ...data,
                cvFileUrl: uploadResult.url,
            })

            if (!result.success) {
                toast.error(result.error || 'Error al crear el miembro')
                return
            }

            toast.success('Miembro creado exitosamente')
            setOpen(false)
            reset()
            setCvFile(null)
            router.refresh()
        } catch (error) {
            toast.error('Ocurrió un error. Por favor intenta de nuevo.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-[#1e293b] hover:bg-[#0f172a]">
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Miembro
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
                <DialogHeader>
                    <DialogTitle className="text-[#0f172a]">Agregar Nuevo Miembro</DialogTitle>
                    <DialogDescription className="text-[#64748b]">
                        Ingresa la información del nuevo miembro
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
                    {/* Contact */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Nombre Completo</Label>
                            <Input id="fullName" {...register('fullName')} />
                            {errors.fullName && (
                                <p className="text-sm text-red-500">{errors.fullName.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" {...register('email')} />
                            {errors.email && (
                                <p className="text-sm text-red-500">{errors.email.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="whatsapp">WhatsApp</Label>
                            <Input id="whatsapp" {...register('whatsapp')} placeholder="+52 55 1234 5678" />
                            {errors.whatsapp && (
                                <p className="text-sm text-red-500">{errors.whatsapp.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                            <Input id="linkedinUrl" {...register('linkedinUrl')} />
                            {errors.linkedinUrl && (
                                <p className="text-sm text-red-500">{errors.linkedinUrl.message}</p>
                            )}
                        </div>
                    </div>

                    {/* CV */}
                    <div className="space-y-2">
                        <Label>CV</Label>
                        <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            className="hidden"
                            id="cv-upload"
                        />
                        <label
                            htmlFor="cv-upload"
                            className={`flex items-center justify-center gap-3 border-2 border-dashed rounded-lg p-4 cursor-pointer transition-colors ${cvFile ? 'border-emerald-300 bg-emerald-50' : 'border-gray-300 hover:border-indigo-400'
                                }`}
                        >
                            {cvFile ? (
                                <>
                                    <FileText className="w-6 h-6 text-emerald-500" />
                                    <span className="text-sm font-medium">{cvFile.name}</span>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-6 h-6 text-gray-400" />
                                    <span className="text-sm text-gray-600">Subir CV (PDF)</span>
                                </>
                            )}
                        </label>
                    </div>

                    {/* Professional */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Área Profesional</Label>
                            <Select onValueChange={(value) => setValue('area', value as MemberFormData['area'])}>
                                <SelectTrigger>
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
                            <Input id="currentRole" {...register('currentRole')} />
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
                            />
                            {errors.yearsExperience && (
                                <p className="text-sm text-red-500">{errors.yearsExperience.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>Nivel de Inglés</Label>
                            <Select onValueChange={(value) => setValue('englishLevel', value as MemberFormData['englishLevel'])}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona nivel" />
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

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="location">Ubicación (Ciudad, País)</Label>
                            <Input id="location" {...register('location')} placeholder="Ej: CDMX, México" />
                            {errors.location && (
                                <p className="text-sm text-red-500">{errors.location.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>Preferencia de Trabajo</Label>
                            <Select onValueChange={(value) => setValue('workPreference', value as MemberFormData['workPreference'])}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona preferencia" />
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
                                <p className="text-sm text-red-500">{errors.workPreference.message}</p>
                            )}
                        </div>
                        {(watch('workPreference') === 'HYBRID' || watch('workPreference') === 'ONSITE') && (
                            <div className="flex items-center pt-8">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="willingToRelocate"
                                        {...register('willingToRelocate')}
                                        className="h-4 w-4 rounded border-gray-300 text-[#1e293b] focus:ring-[#1e293b]"
                                    />
                                    <Label htmlFor="willingToRelocate">¿Dispuesto a mudarse a CDMX?</Label>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creando...
                                </>
                            ) : (
                                'Crear Miembro'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
