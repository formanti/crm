'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react'
import { importMembers } from '@/actions/members'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

interface ImportRow {
    email: string
    fullName: string
    whatsapp?: string
    linkedinUrl?: string
    role?: string
    [key: string]: unknown
}

export function ImportMemberButton() {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [previewData, setPreviewData] = useState<ImportRow[]>([])
    const [file, setFile] = useState<File | null>(null)
    const [stats, setStats] = useState<{
        total: number
        created: number
        updated: number
        skipped: number
        errors: number
    } | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)

    const resetState = () => {
        setFile(null)
        setPreviewData([])
        setStats(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open)
        if (!open) {
            // Delay reset to allow animation to finish
            setTimeout(resetState, 300)
        }
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (!selectedFile) return

        setFile(selectedFile)
        setStats(null)

        try {
            const data = await parseExcel(selectedFile)
            setPreviewData(data)
        } catch (error) {
            console.error('Error parsing file:', error)
            toast.error('Error al leer el archivo. Asegúrate que sea un Excel o CSV válido.')
            setFile(null)
            setPreviewData([])
        }
    }

    const parseExcel = (file: File): Promise<ImportRow[]> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => {
                try {
                    const data = e.target?.result
                    const workbook = XLSX.read(data, { type: 'binary' })
                    const sheetName = workbook.SheetNames[0]
                    const sheet = workbook.Sheets[sheetName]
                    const jsonData: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet)

                    // Helper to fuzzy match keys
                    const getValue = (row: Record<string, unknown>, possibleKeys: string[]) => {
                        const rowKeys = Object.keys(row)

                        for (let i = 0; i < possibleKeys.length; i++) {
                            const key = possibleKeys[i]
                            const exactMatch = row[key] // Direct usage works because of Record
                            if (exactMatch !== undefined) return exactMatch

                            // Try normalized match
                            const normalizedKey = key.toLowerCase().trim()
                            const foundKey = rowKeys.find(k => k.toLowerCase().trim() === normalizedKey)
                            if (foundKey) return row[foundKey]
                        }
                        return undefined
                    }

                    const normalizedData: ImportRow[] = jsonData.map((row: Record<string, unknown>) => ({
                        email: String(getValue(row, ['Email', 'Correo', 'Mail', 'E-mail', 'Correo Electrónico']) || ''),
                        fullName: String(getValue(row, ['Full Name', 'Nombre', 'Nombre Completo', 'Name', 'Nombres', 'Member Name']) || ''),
                        whatsapp: String(getValue(row, ['WhatsApp', 'Whatsapp', 'Telefono', 'Teléfono', 'Celular', 'Phone', 'Mobile']) || ''),
                        linkedinUrl: String(getValue(row, ['LinkedIn', 'Linkedin', 'LinkedIn URL', 'URL Linkedin', 'Perfil Linkedin', 'Linkedin Profile']) || ''),
                        role: String(getValue(row, ['Current Role', 'Rol', 'Cargo', 'Role', 'Puesto', 'Job Title']) || '')
                    })).filter((item: ImportRow) => item.email && item.fullName)

                    // Filter out empty rows (where name and email are missing)
                    const validData = normalizedData.filter(d => d.fullName || d.email)

                    resolve(validData)
                } catch (error) {
                    reject(error)
                }
            }
            reader.onerror = (error) => reject(error)
            reader.readAsBinaryString(file)
        })
    }

    const handleImport = async () => {
        if (previewData.length === 0) return

        setIsLoading(true)
        try {
            const result = await importMembers(previewData)

            if (result.success && result.stats) {
                setStats(result.stats)
                toast.success('Importación completada')
            } else {
                toast.error(result.error || 'Error al importar miembros')
            }
        } catch (error) {
            console.error('Error importing:', error)
            toast.error('Error inesperado al importar')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 bg-white hover:bg-slate-50 text-slate-700 border-slate-200">
                    <FileSpreadsheet className="h-4 w-4" />
                    Importar Excel
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Importar Miembros Masivamente</DialogTitle>
                    <DialogDescription>
                        Carga un archivo Excel o CSV para añadir o actualizar miembros rápidamente.
                    </DialogDescription>
                </DialogHeader>

                {!stats ? (
                    <div className="grid gap-4 py-4">
                        <div
                            className={cn(
                                "border-2 border-dashed rounded-lg p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer",
                                file ? "border-green-500 bg-green-50/50" : "border-slate-200"
                            )}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx, .xls, .csv"
                                className="hidden"
                                onChange={handleFileChange}
                            />

                            {file ? (
                                <div className="flex flex-col items-center gap-2">
                                    <FileSpreadsheet className="h-10 w-10 text-green-600" />
                                    <p className="font-medium text-slate-900">{file.name}</p>
                                    <p className="text-sm text-slate-500">{previewData.length} contactos encontrados</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <Upload className="h-10 w-10 text-slate-400" />
                                    <p className="font-medium text-slate-900">Click para seleccionar archivo</p>
                                    <p className="text-sm text-slate-500">Soporta .xlsx, .xls, .csv</p>
                                </div>
                            )}
                        </div>

                        {file && (
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Importante</AlertTitle>
                                <AlertDescription>
                                    Se buscarán los miembros por email. Si ya existen, se actualizarán sus datos.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                ) : (
                    <div className="py-4 space-y-4">
                        <div className="flex flex-col items-center justify-center text-center p-6 bg-green-50 rounded-lg border border-green-100">
                            <CheckCircle2 className="h-12 w-12 text-green-600 mb-2" />
                            <h3 className="font-medium text-green-900 text-lg">Proceso Completado</h3>
                            <p className="text-green-700">Se han procesado {stats.total} registros</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <StatBox label="Creados" value={stats.created} color="bg-blue-50 text-blue-700 border-blue-100" />
                            <StatBox label="Actualizados" value={stats.updated} color="bg-amber-50 text-amber-700 border-amber-100" />
                            <StatBox label="Omitidos" value={stats.skipped} color="bg-slate-50 text-slate-600 border-slate-100" />
                            <StatBox label="Errores" value={stats.errors} color="bg-red-50 text-red-700 border-red-100" />
                        </div>
                    </div>
                )}

                <DialogFooter>
                    {!stats ? (
                        <>
                            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                            <Button onClick={handleImport} disabled={!file || isLoading}>
                                {isLoading ? 'Importando...' : 'Importar Miembros'}
                            </Button>
                        </>
                    ) : (
                        <Button onClick={() => setIsOpen(false)} className="w-full">Cerrar</Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function StatBox({ label, value, color }: { label: string, value: number, color: string }) {
    return (
        <div className={cn("p-3 rounded border text-center", color)}>
            <div className="text-2xl font-semibold">{value}</div>
            <div className="text-xs uppercase font-medium tracking-wide opacity-80">{label}</div>
        </div>
    )
}
