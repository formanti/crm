'use client'

import { useRouter } from 'next/navigation'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
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
        bg-white rounded-lg border border-[#e2e8f0] p-3 cursor-grab active:cursor-grabbing
        hover:border-[#94a3b8] transition-all
        ${isDragging || isSortableDragging ? 'opacity-50 shadow-lg scale-105' : 'shadow-sm'}
      `}
            onClick={() => router.push(`/members/${member.id}`)}
        >
            <div className="space-y-2">
                <div>
                    <h4 className="font-medium text-[#0f172a] text-sm line-clamp-1">{member.fullName}</h4>
                    <p className="text-xs text-[#64748b] line-clamp-1">{member.currentRole}</p>
                </div>

                <span className="inline-block bg-[#f1f5f9] text-[#64748b] text-xs px-2 py-0.5 rounded">
                    {getAreaLabel(member.area)}
                </span>

                {isContratado && member.hiredCompany && (
                    <div className="pt-2 border-t border-[#e2e8f0] space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-[#22c55e]">
                            <Building2 className="h-3 w-3" />
                            <span className="font-medium">{member.hiredCompany}</span>
                        </div>
                        {member.hiredDate && (
                            <div className="flex items-center gap-1.5 text-xs text-[#94a3b8]">
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
