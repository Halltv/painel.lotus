
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import ClientForm from './ClientForm.jsx';

export default function ClientFormModal({ isOpen, onClose, onSubmit, initialData, isLoading }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {initialData ? 'Editar Cliente' : 'Novo Cliente'}
          </DialogTitle>
          <DialogDescription>
            {initialData 
              ? 'Atualize as informações do cliente abaixo.' 
              : 'Preencha os dados para cadastrar um novo cliente no sistema.'}
          </DialogDescription>
        </DialogHeader>

        <ClientForm 
          initialData={initialData} 
          onSubmit={onSubmit} 
          onCancel={onClose}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
