'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Search, ArrowUpDown, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { areaOptions } from '@/lib/validations'
import type { Member, Stage } from '@prisma/client'

type MemberWithStage = Member & { stage: Stage }

interface MembersTableProps {
    members: MemberWithStage[]
}

export function MembersTable({ members }: MembersTableProps) {
    const router = useRouter()
    const [search, setSearch] = useState('')
    const [sortField, setSortField] = useState<'fullName' | 'createdAt'>('createdAt')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    const filteredMembers = useMemo(() => {
        return members.filter(member =>
            member.fullName.toLowerCase().includes(search.toLowerCase()) ||
            member.email.toLowerCase().includes(search.toLowerCase())
        )
    }, [members, search])

    const sortedMembers = useMemo(() => {
        return [...filteredMembers].sort((a, b) => {
            if (sortField === 'fullName') {
                return sortDirection === 'asc'
                    ? a.fullName.localeCompare(b.fullName)
                    : b.fullName.localeCompare(a.fullName)
            } else {
                return sortDirection === 'asc'
                    ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                    : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            }
        })
    }, [filteredMembers, sortField, sortDirection])

    const totalPages = Math.ceil(sortedMembers.length / itemsPerPage)
    const paginatedMembers = sortedMembers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const toggleSort = (field: 'fullName' | 'createdAt') => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDirection('asc')
        }
    }

    const getAreaLabel = (area: string) => {
        return areaOptions.find(o => o.value === area)?.label || area
    }

    const getStatusBadge = (stageName: string) => {
        const name = stageName.toLowerCase()
        if (name === 'contratado') {
            return 'badge-done'
        } else if (name === 'referido' || name === 'calificado') {
            return 'badge-in-progress'
        }
        return 'badge-default'
    }

    return (
        <div>
            {/* Search & Filters */}
            <div className="p-4 border-b border-[#e2e8f0]">
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
                    <Input
                        placeholder="Buscar por nombre o email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 h-10 bg-[#f8fafc] border-[#e2e8f0] rounded-lg"
                    />
                </div>
            </div>

            {/* Table */}
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent border-b border-[#e2e8f0]">
                        <TableHead className="w-[50px] text-[#64748b] font-medium">
                            <input type="checkbox" className="rounded border-[#e2e8f0]" />
                        </TableHead>
                        <TableHead className="text-[#64748b] font-medium">
                            <button
                                onClick={() => toggleSort('fullName')}
                                className="flex items-center gap-1 hover:text-[#0f172a]"
                            >
                                Nombre
                                <ArrowUpDown className="h-3.5 w-3.5" />
                            </button>
                        </TableHead>
                        <TableHead className="text-[#64748b] font-medium">Status</TableHead>
                        <TableHead className="text-[#64748b] font-medium">Área</TableHead>
                        <TableHead className="text-[#64748b] font-medium">
                            <button
                                onClick={() => toggleSort('createdAt')}
                                className="flex items-center gap-1 hover:text-[#0f172a]"
                            >
                                Registrado
                                <ArrowUpDown className="h-3.5 w-3.5" />
                            </button>
                        </TableHead>
                        <TableHead className="text-[#64748b] font-medium w-[100px] text-center">CV</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedMembers.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-12 text-[#64748b]">
                                No se encontraron miembros
                            </TableCell>
                        </TableRow>
                    ) : (
                        paginatedMembers.map((member) => (
                            <TableRow
                                key={member.id}
                                className="cursor-pointer hover:bg-[#f8fafc] border-b border-[#e2e8f0]"
                                onClick={() => router.push(`/members/${member.id}`)}
                            >
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                    <input type="checkbox" className="rounded border-[#e2e8f0]" />
                                </TableCell>
                                <TableCell>
                                    <div>
                                        <p className="font-medium text-[#0f172a]">{member.fullName}</p>
                                        <p className="text-sm text-[#64748b]">{member.email}</p>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className={getStatusBadge(member.stage.name)}>
                                        {member.stage.name}
                                    </span>
                                </TableCell>
                                <TableCell className="text-[#64748b]">
                                    {getAreaLabel(member.area)}
                                </TableCell>
                                <TableCell className="text-[#64748b]">
                                    {format(new Date(member.createdAt), 'dd MMM yyyy', { locale: es })}
                                </TableCell>
                                <TableCell className="text-center">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            window.open(member.cvFileUrl, '_blank')
                                        }}
                                        className="h-8 w-8 p-0 hover:bg-[#f1f5f9]"
                                    >
                                        <Download className="h-4 w-4 text-[#64748b]" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 p-4 border-t border-[#e2e8f0]">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="h-9 px-3 border-[#e2e8f0]"
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Anterior
                    </Button>
                    <span className="text-sm text-[#64748b] px-4">
                        Página {currentPage} de {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="h-9 px-3 border-[#e2e8f0]"
                    >
                        Siguiente
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            )}
        </div>
    )
}
