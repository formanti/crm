'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Loader2, Briefcase } from 'lucide-react'

interface HiredModalProps {
    open: boolean
    onConfirm: (data: { hiredCompany: string; hiredDate: Date; hiredSalaryUsd: number }) => Promise<void>
    onCancel: () => void
}

export function HiredModal({ open, onConfirm, onCancel }: HiredModalProps) {
    const [company, setCompany] = useState('')
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [salary, setSalary] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const handleConfirm = async () => {
        if (!company.trim()) {
            setError('Ingresa el nombre de la empresa')
            return
        }
        if (!salary || parseInt(salary) < 0) {
            setError('Ingresa un salario válido')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            await onConfirm({
                hiredCompany: company.trim(),
                hiredDate: new Date(date),
                hiredSalaryUsd: parseInt(salary),
            })
            setCompany('')
            setDate(new Date().toISOString().split('T')[0])
            setSalary('')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancel = () => {
        setCompany('')
        setDate(new Date().toISOString().split('T')[0])
        setSalary('')
        setError('')
        onCancel()
    }

    return (
        <Dialog open={open} onOpenChange={(open) => !open && handleCancel()}>
            <DialogContent className="bg-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 text-[#0f172a]">
                        <div className="w-10 h-10 bg-[#dcfce7] rounded-lg flex items-center justify-center">
                            <Briefcase className="h-5 w-5 text-[#22c55e]" />
                        </div>
                        <span>¡Miembro Contratado!</span>
                    </DialogTitle>
                    <DialogDescription className="text-[#64748b]">
                        Ingresa los detalles de la contratación
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="company" className="text-sm font-medium text-[#0f172a]">
                            Empresa
                        </Label>
                        <Input
                            id="company"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            placeholder="Nombre de la empresa"
                            className="h-10 border-[#e2e8f0]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date" className="text-sm font-medium text-[#0f172a]">
                            Fecha de contratación
                        </Label>
                        <Input
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="h-10 border-[#e2e8f0]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="salary" className="text-sm font-medium text-[#0f172a]">
                            Salario anual (USD)
                        </Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]">$</span>
                            <Input
                                id="salary"
                                type="number"
                                min="0"
                                value={salary}
                                onChange={(e) => setSalary(e.target.value)}
                                placeholder="50000"
                                className="pl-7 h-10 border-[#e2e8f0]"
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-red-500">{error}</p>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleCancel} className="border-[#e2e8f0]">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="bg-[#22c55e] hover:bg-[#16a34a]"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            'Confirmar'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
