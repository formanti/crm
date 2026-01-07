'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { memberUpdateSchema, type MemberUpdateData, areaOptions, englishLevelOptions } from '@/lib/validations'
import { updateMember, deleteMember } from '@/actions/members'
import { createReferral, deleteReferral } from '@/actions/referrals'
import {
    ArrowLeft,
    Save,
    Trash2,
    Download,
    ExternalLink,
    Building2,
    Calendar,
    DollarSign,
    Plus,
    Loader2,
    Linkedin,
    Phone,
    Mail,
    Briefcase
} from 'lucide-react'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog'
import type { Member, Stage, Referral } from '@prisma/client'

interface MemberDetailProps {
    member: Member & { stage: Stage; referrals: Referral[] }
    stages: (Stage & { _count?: { members: number } })[]
}

const stageColors: Record<string, string> = {
    'info-cargada': 'bg-slate-100 text-slate-700',
    'calificado': 'bg-blue-100 text-blue-700',
    'referido': 'bg-amber-100 text-amber-700',
    'contratado': 'bg-emerald-100 text-emerald-700',
}

export function MemberDetail({ member, stages }: MemberDetailProps) {
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [referralDialogOpen, setReferralDialogOpen] = useState(false)
    const [newReferral, setNewReferral] = useState({ companyName: '', notes: '' })
    const [addingReferral, setAddingReferral] = useState(false)

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<MemberUpdateData>({
        resolver: zodResolver(memberUpdateSchema),
        defaultValues: {
            fullName: member.fullName,
            email: member.email,
            whatsapp: member.whatsapp,
            linkedinUrl: member.linkedinUrl,
            area: member.area,
            currentRole: member.currentRole,
            yearsExperience: member.yearsExperience,
            englishLevel: member.englishLevel,
            notes: member.notes || '',
            hiredCompany: member.hiredCompany,
            hiredSalaryUsd: member.hiredSalaryUsd,
        },
    })

    const isContratado = member.stage.id === 'contratado'

    const onSubmit = async (data: MemberUpdateData) => {
        setIsSaving(true)
        try {
            const result = await updateMember(member.id, data)
            if (result.success) {
                toast.success('Miembro actualizado')
                setIsEditing(false)
                router.refresh()
            } else {
                toast.error(result.error || 'Error al actualizar')
            }
        } catch (error) {
            toast.error('Error al actualizar')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            const result = await deleteMember(member.id)
            if (result.success) {
                toast.success('Miembro eliminado')
                router.push('/members')
            } else {
                toast.error(result.error || 'Error al eliminar')
            }
        } catch (error) {
            toast.error('Error al eliminar')
        } finally {
            setIsDeleting(false)
            setDeleteDialogOpen(false)
        }
    }

    const handleAddReferral = async () => {
        if (!newReferral.companyName.trim()) {
            toast.error('Ingresa el nombre de la empresa')
            return
        }

        setAddingReferral(true)
        try {
            const result = await createReferral(member.id, {
                companyName: newReferral.companyName,
                referralDate: new Date(),
                notes: newReferral.notes || undefined,
            })
            if (result.success) {
                toast.success('Referencia agregada')
                setNewReferral({ companyName: '', notes: '' })
                setReferralDialogOpen(false)
                router.refresh()
            } else {
                toast.error(result.error || 'Error')
            }
        } catch (error) {
            toast.error('Error')
        } finally {
            setAddingReferral(false)
        }
    }

    const handleDeleteReferral = async (referralId: string) => {
        try {
            const result = await deleteReferral(referralId)
            if (result.success) {
                toast.success('Referencia eliminada')
                router.refresh()
            } else {
                toast.error(result.error || 'Error')
            }
        } catch (error) {
            toast.error('Error')
        }
    }

    const getAreaLabel = (area: string) => areaOptions.find(o => o.value === area)?.label || area
    const getEnglishLabel = (level: string) => englishLevelOptions.find(o => o.value === level)?.label || level

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/members">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{member.fullName}</h1>
                        <p className="text-gray-500">{member.currentRole}</p>
                    </div>
                    <Badge className={stageColors[member.stage.id] || 'bg-gray-100 text-gray-700'}>
                        {member.stage.name}
                    </Badge>
                </div>
                <div className="flex items-center gap-3">
                    {isEditing ? (
                        <>
                            <Button variant="outline" onClick={() => setIsEditing(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleSubmit(onSubmit)} disabled={isSaving}>
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                Guardar
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={() => setIsEditing(true)}>
                                Editar
                            </Button>
                            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>¿Eliminar miembro?</DialogTitle>
                                        <DialogDescription>
                                            Esta acción no se puede deshacer. Se eliminará toda la información del miembro.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                                            Cancelar
                                        </Button>
                                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                            Eliminar
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </>
                    )}
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Información de Contacto</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isEditing ? (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <Input {...register('email')} />
                                        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>WhatsApp</Label>
                                        <Input {...register('whatsapp')} />
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <Label>LinkedIn</Label>
                                        <Input {...register('linkedinUrl')} />
                                    </div>
                                </div>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                        <span>{member.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-5 w-5 text-gray-400" />
                                        <span>{member.whatsapp}</span>
                                    </div>
                                    <div className="flex items-center gap-3 sm:col-span-2">
                                        <Linkedin className="h-5 w-5 text-gray-400" />
                                        <a href={member.linkedinUrl} target="_blank" rel="noopener" className="text-indigo-600 hover:underline flex items-center gap-1">
                                            Ver perfil <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Perfil Profesional</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isEditing ? (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Área</Label>
                                        <Select defaultValue={member.area} onValueChange={(v) => setValue('area', v as MemberUpdateData['area'])}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {areaOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Rol Actual</Label>
                                        <Input {...register('currentRole')} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Años de Experiencia</Label>
                                        <Input type="number" {...register('yearsExperience', { valueAsNumber: true })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Inglés</Label>
                                        <Select defaultValue={member.englishLevel} onValueChange={(v) => setValue('englishLevel', v as MemberUpdateData['englishLevel'])}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {englishLevelOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <span className="text-sm text-gray-500">Área</span>
                                        <p className="font-medium">{getAreaLabel(member.area)}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500">Rol</span>
                                        <p className="font-medium">{member.currentRole}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500">Experiencia</span>
                                        <p className="font-medium">{member.yearsExperience} años</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500">Inglés</span>
                                        <p className="font-medium">{getEnglishLabel(member.englishLevel)}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Notas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isEditing ? (
                                <Textarea {...register('notes')} placeholder="Agrega notas sobre este miembro..." rows={4} />
                            ) : (
                                <p className="text-gray-600">{member.notes || 'Sin notas'}</p>
                            )}
                        </CardContent>
                    </Card>

                    {isContratado && (
                        <Card className="border-emerald-200 bg-emerald-50">
                            <CardHeader>
                                <CardTitle className="text-lg text-emerald-800 flex items-center gap-2">
                                    <Briefcase className="h-5 w-5" />
                                    Información de Contratación
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isEditing ? (
                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label>Empresa</Label>
                                            <Input {...register('hiredCompany')} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Salario USD</Label>
                                            <Input type="number" {...register('hiredSalaryUsd', { valueAsNumber: true })} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-emerald-600" />
                                            <span className="font-medium">{member.hiredCompany || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-emerald-600" />
                                            <span>{member.hiredDate ? format(new Date(member.hiredDate), 'dd MMM yyyy', { locale: es }) : 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-4 w-4 text-emerald-600" />
                                            <span>${member.hiredSalaryUsd?.toLocaleString() || 'N/A'} USD</span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">CV</CardTitle>
                            <Button variant="outline" size="sm" onClick={() => window.open(member.cvFileUrl, '_blank')}>
                                <Download className="h-4 w-4 mr-2" />
                                Descargar
                            </Button>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">Referidos a</CardTitle>
                            <Dialog open={referralDialogOpen} onOpenChange={setReferralDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Nueva Referencia</DialogTitle>
                                        <DialogDescription>
                                            Registra a qué empresa fue referido este miembro
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Empresa</Label>
                                            <Input
                                                value={newReferral.companyName}
                                                onChange={(e) => setNewReferral(prev => ({ ...prev, companyName: e.target.value }))}
                                                placeholder="Nombre de la empresa"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Notas (opcional)</Label>
                                            <Textarea
                                                value={newReferral.notes}
                                                onChange={(e) => setNewReferral(prev => ({ ...prev, notes: e.target.value }))}
                                                placeholder="Detalles adicionales..."
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setReferralDialogOpen(false)}>
                                            Cancelar
                                        </Button>
                                        <Button onClick={handleAddReferral} disabled={addingReferral}>
                                            {addingReferral ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                            Agregar
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            {member.referrals.length === 0 ? (
                                <p className="text-sm text-gray-500">No hay referencias registradas</p>
                            ) : (
                                <div className="space-y-3">
                                    {member.referrals.map((ref) => (
                                        <div key={ref.id} className="flex items-start justify-between p-3 bg-slate-50 rounded-lg">
                                            <div>
                                                <p className="font-medium">{ref.companyName}</p>
                                                <p className="text-xs text-gray-500">
                                                    {format(new Date(ref.referralDate), 'dd MMM yyyy', { locale: es })}
                                                </p>
                                                {ref.notes && <p className="text-sm text-gray-600 mt-1">{ref.notes}</p>}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => handleDeleteReferral(ref.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-sm text-gray-500 space-y-1">
                                <p>Registrado: {format(new Date(member.createdAt), 'dd MMM yyyy', { locale: es })}</p>
                                <p>Actualizado: {format(new Date(member.updatedAt), 'dd MMM yyyy', { locale: es })}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
