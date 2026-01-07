import { Suspense } from 'react'
import { getMembers } from '@/actions/members'
import { getStages } from '@/actions/stages'
import { MembersTable } from '@/components/members/members-table'
import { AddMemberButton } from '@/components/members/add-member-button'
import { Loader2 } from 'lucide-react'

export default async function MembersPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string }>
}) {
    const params = await searchParams
    const [membersResult, stagesResult] = await Promise.all([
        getMembers(params.search),
        getStages(),
    ])

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Miembros</h1>
                    <p className="text-gray-500 mt-1">
                        Gestiona los miembros de la comunidad NEWAVE
                    </p>
                </div>
                <AddMemberButton />
            </div>

            <Suspense fallback={
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                </div>
            }>
                <MembersTable
                    members={membersResult.members || []}
                    stages={stagesResult.stages || []}
                    initialSearch={params.search}
                />
            </Suspense>
        </div>
    )
}
