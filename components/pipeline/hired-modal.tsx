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
            // Reset form
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
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                            <Briefcase className="h-5 w-5 text-emerald-600" />
                        </div>
                        <span>¡Felicidades! Miembro Contratado</span>
                    </DialogTitle>
                    <DialogDescription>
                        Ingresa los detalles de la contratación
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="company">Empresa</Label>
                        <Input
                            id="company"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            placeholder="Nombre de la empresa"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date">Fecha de contratación</Label>
                        <Input
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="salary">Salario anual (USD)</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                            <Input
                                id="salary"
                                type="number"
                                min="0"
                                value={salary}
                                onChange={(e) => setSalary(e.target.value)}
                                placeholder="50000"
                                className="pl-7"
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-red-500">{error}</p>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleCancel}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="bg-emerald-600 hover:bg-emerald-700"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            'Confirmar Contratación'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
