import { getMembers } from '@/actions/members'
import { getStages } from '@/actions/stages'
import { MembersTable } from '@/components/members/members-table'
import { AddMemberButton } from '@/components/members/add-member-button'
import { ImportMemberButton } from '@/components/members/import-member-button'
import { Users, TrendingUp, Briefcase } from 'lucide-react'

export default async function MembersPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string }>
}) {
    const { search } = await searchParams
    const result = await getMembers(search)
    const stagesResult = await getStages()

    const members = result.members || []
    const stages = stagesResult.stages || []

    // Calculate stats
    const totalMembers = members.length
    const hiredMembers = members.filter(m => m.stage?.name?.toLowerCase() === 'contratado').length
    const qualifiedMembers = members.filter(m => m.stage?.name?.toLowerCase() === 'calificado').length

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-semibold text-[#0f172a]">Miembros</h1>
                    <p className="text-[#64748b] mt-1">Gestiona los miembros de la comunidad</p>
                </div>
                <div className="flex gap-2">
                    <ImportMemberButton />
                    <AddMemberButton />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                <StatCard
                    title="Total Miembros"
                    value={totalMembers}
                    icon={Users}
                />
                <StatCard
                    title="Calificados"
                    value={qualifiedMembers}
                    icon={TrendingUp}
                    trend={totalMembers > 0 ? Math.round((qualifiedMembers / totalMembers) * 100) : 0}
                />
                <StatCard
                    title="Contratados"
                    value={hiredMembers}
                    icon={Briefcase}
                    trend={totalMembers > 0 ? Math.round((hiredMembers / totalMembers) * 100) : 0}
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border border-[#e2e8f0]">
                <MembersTable members={members} />
            </div>
        </div>
    )
}

function StatCard({
    title,
    value,
    icon: Icon,
    trend
}: {
    title: string
    value: number
    icon: React.ComponentType<{ className?: string }>
    trend?: number
}) {
    return (
        <div className="bg-white rounded-lg border border-[#e2e8f0] p-5">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#64748b]">{title}</p>
                <Icon className="h-5 w-5 text-[#94a3b8]" />
            </div>
            <div className="flex items-end gap-3 mt-2">
                <p className="text-3xl font-bold text-[#0f172a]">{value}</p>
                {trend !== undefined && (
                    <span className="text-sm font-medium text-[#22c55e] mb-1">
                        {trend}%
                    </span>
                )}
            </div>
        </div>
    )
}
