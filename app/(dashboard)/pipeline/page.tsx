import { getMembersByStage } from '@/actions/stages'
import { KanbanBoard } from '@/components/pipeline/kanban-board'

export default async function PipelinePage() {
    const result = await getMembersByStage()

    return (
        <div className="h-[calc(100vh-0px)] flex flex-col">
            {/* Header */}
            <div className="p-8 pb-4">
                <h1 className="text-2xl font-semibold text-[#0f172a]">Pipeline</h1>
                <p className="text-[#64748b] mt-1">
                    Arrastra los miembros entre etapas para actualizar su progreso
                </p>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-hidden px-8 pb-8">
                <KanbanBoard stages={result.stages || []} />
            </div>
        </div>
    )
}
