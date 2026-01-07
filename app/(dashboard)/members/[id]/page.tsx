import { notFound } from 'next/navigation'
import { getMember } from '@/actions/members'
import { getStages } from '@/actions/stages'
import { MemberDetail } from '@/components/members/member-detail'

export default async function MemberPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const [memberResult, stagesResult] = await Promise.all([
        getMember(id),
        getStages(),
    ])

    if (!memberResult.success || !memberResult.member) {
        notFound()
    }

    return (
        <div className="p-8">
            <MemberDetail
                member={memberResult.member}
                stages={stagesResult.stages || []}
            />
        </div>
    )
}
