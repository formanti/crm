'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Download, ExternalLink, ArrowUpDown } from 'lucide-react'
import { areaOptions, englishLevelOptions } from '@/lib/validations'
import type { Member, Stage } from '@prisma/client'

interface MembersTableProps {
    members: (Member & { stage: Stage })[]
    stages: Stage[]
    initialSearch?: string
}

const stageColors: Record<string, string> = {
    'info-cargada': 'bg-slate-100 text-slate-700',
    'calificado': 'bg-blue-100 text-blue-700',
    'referido': 'bg-amber-100 text-amber-700',
    'contratado': 'bg-emerald-100 text-emerald-700',
}

export function MembersTable({ members, stages, initialSearch }: MembersTableProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [search, setSearch] = useState(initialSearch || '')
    const [isPending, startTransition] = useTransition()
    const [sortField, setSortField] = useState<keyof Member>('createdAt')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

    const handleSearch = (value: string) => {
        setSearch(value)
        startTransition(() => {
            const params = new URLSearchParams(searchParams.toString())
            if (value) {
                params.set('search', value)
            } else {
                params.delete('search')
            }
            router.push(`/members?${params.toString()}`)
        })
    }

    const handleSort = (field: keyof Member) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDirection('asc')
        }
    }

    const sortedMembers = [...members].sort((a, b) => {
        const aValue = a[sortField]
        const bValue = b[sortField]

        if (aValue === null || aValue === undefined) return 1
        if (bValue === null || bValue === undefined) return -1

        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortDirection === 'asc'
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue)
        }

        if (aValue instanceof Date && bValue instanceof Date) {
            return sortDirection === 'asc'
                ? aValue.getTime() - bValue.getTime()
                : bValue.getTime() - aValue.getTime()
        }

        return sortDirection === 'asc'
            ? (aValue as number) - (bValue as number)
            : (bValue as number) - (aValue as number)
    })

    const getAreaLabel = (area: string) => {
        return areaOptions.find(o => o.value === area)?.label || area
    }

    const getEnglishLabel = (level: string) => {
        return englishLevelOptions.find(o => o.value === level)?.label || level
    }

    return (
        <div className="space-y-4">
            {/* Search */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Buscar por nombre o email..."
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10 h-11"
                    />
                </div>
                <div className="text-sm text-gray-500">
                    {members.length} miembro{members.length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/80">
                            <TableHead className="font-semibold">
                                <Button
                                    variant="ghost"
                                    className="h-auto p-0 hover:bg-transparent font-semibold"
                                    onClick={() => handleSort('fullName')}
                                >
                                    Nombre
                                    <ArrowUpDown className="ml-2 h-4 w-4" />
                                </Button>
                            </TableHead>
                            <TableHead className="font-semibold">Email</TableHead>
                            <TableHead className="font-semibold">WhatsApp</TableHead>
                            <TableHead className="font-semibold">Área</TableHead>
                            <TableHead className="font-semibold">Rol</TableHead>
                            <TableHead className="font-semibold text-center">Exp.</TableHead>
                            <TableHead className="font-semibold">Inglés</TableHead>
                            <TableHead className="font-semibold">Etapa</TableHead>
                            <TableHead className="font-semibold">
                                <Button
                                    variant="ghost"
                                    className="h-auto p-0 hover:bg-transparent font-semibold"
                                    onClick={() => handleSort('createdAt')}
                                >
                                    Registro
                                    <ArrowUpDown className="ml-2 h-4 w-4" />
                                </Button>
                            </TableHead>
                            <TableHead className="font-semibold text-center">CV</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedMembers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={10} className="text-center py-12 text-gray-500">
                                    {search ? 'No se encontraron miembros' : 'No hay miembros registrados'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedMembers.map((member) => (
                                <TableRow
                                    key={member.id}
                                    className="cursor-pointer hover:bg-slate-50 transition-colors"
                                    onClick={() => router.push(`/members/${member.id}`)}
                                >
                                    <TableCell className="font-medium">{member.fullName}</TableCell>
                                    <TableCell className="text-gray-600">{member.email}</TableCell>
                                    <TableCell className="text-gray-600">{member.whatsapp}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="font-normal">
                                            {getAreaLabel(member.area)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-gray-600 max-w-[150px] truncate">
                                        {member.currentRole}
                                    </TableCell>
                                    <TableCell className="text-center text-gray-600">
                                        {member.yearsExperience}
                                    </TableCell>
                                    <TableCell className="text-gray-600">
                                        {getEnglishLabel(member.englishLevel)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={stageColors[member.stage.id] || 'bg-gray-100 text-gray-700'}>
                                            {member.stage.name}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-gray-500 text-sm">
                                        {format(new Date(member.createdAt), 'dd MMM yyyy', { locale: es })}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                window.open(member.cvFileUrl, '_blank')
                                            }}
                                        >
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
