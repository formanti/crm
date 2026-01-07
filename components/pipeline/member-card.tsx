'use client'

import { useRouter } from 'next/navigation'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Badge } from '@/components/ui/badge'
import { Building2, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { areaOptions } from '@/lib/validations'
import type { Member } from '@prisma/client'

interface MemberCardProps {
    member: Member
    isDragging?: boolean
}

export function MemberCard({ member, isDragging }: MemberCardProps) {
    const router = useRouter()

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging: isSortableDragging,
    } = useSortable({ id: member.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    const getAreaLabel = (area: string) => {
        return areaOptions.find(o => o.value === area)?.label || area
    }

    const isContratado = member.stageId === 'contratado'

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`
        bg-white rounded-lg border border-gray-200 p-4 cursor-grab active:cursor-grabbing
        shadow-sm hover:shadow-md transition-all
        ${isDragging || isSortableDragging ? 'opacity-50 shadow-lg scale-105 rotate-2' : ''}
      `}
            onClick={() => router.push(`/members/${member.id}`)}
        >
            <div className="space-y-2">
                <div className="flex items-start justify-between">
                    <h4 className="font-medium text-gray-900 line-clamp-1">{member.fullName}</h4>
                </div>

                <p className="text-sm text-gray-500 line-clamp-1">{member.currentRole}</p>

                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs font-normal">
                        {getAreaLabel(member.area)}
                    </Badge>
                </div>

                {isContratado && member.hiredCompany && (
                    <div className="pt-2 border-t border-gray-100 space-y-1">
                        <div className="flex items-center gap-2 text-sm text-emerald-600">
                            <Building2 className="h-3.5 w-3.5" />
                            <span className="font-medium">{member.hiredCompany}</span>
                        </div>
                        {member.hiredDate && (
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Calendar className="h-3 w-3" />
                                <span>{format(new Date(member.hiredDate), 'dd MMM yyyy', { locale: es })}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
