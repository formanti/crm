import { getMembersByStage, getStages } from '@/actions/stages'
import { KanbanBoard } from '@/components/pipeline/kanban-board'

export default async function PipelinePage() {
    const result = await getMembersByStage()

    return (
        <div className="h-[calc(100vh-0px)] flex flex-col">
            <div className="p-8 pb-4">
                <h1 className="text-3xl font-bold text-gray-900">Pipeline de Colocación</h1>
                <p className="text-gray-500 mt-1">
                    Arrastra los miembros entre etapas para actualizar su progreso
                </p>
            </div>

            <div className="flex-1 overflow-hidden px-8 pb-8">
                <KanbanBoard stages={result.stages || []} />
            </div>
        </div>
    )
}
