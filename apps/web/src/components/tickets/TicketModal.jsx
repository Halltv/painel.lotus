
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TicketDetailsTab from './TicketDetailsTab.jsx';
import TicketHistoryTab from './TicketHistoryTab.jsx';
import TicketActivityTab from './TicketActivityTab.jsx';
import { FileText, History, Activity } from 'lucide-react';

export default function TicketModal({ isOpen, onClose, ticket, onSave, onDelete }) {
  const [activeTab, setActiveTab] = useState('details');

  // Reset tab when modal opens/closes
  React.useEffect(() => {
    if (isOpen) setActiveTab('details');
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
        <div className="p-6 pb-4 border-b bg-muted/10">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {ticket ? `Chamado: ${ticket.id}` : 'Novo Chamado'}
            </DialogTitle>
          </DialogHeader>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 pt-4 border-b">
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent gap-6">
              <TabsTrigger 
                value="details" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 pt-2 font-medium"
              >
                <FileText className="h-4 w-4 mr-2" />
                Detalhes
              </TabsTrigger>
              
              {ticket && (
                <>
                  <TabsTrigger 
                    value="history" 
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 pt-2 font-medium"
                  >
                    <History className="h-4 w-4 mr-2" />
                    Histórico do Cliente
                  </TabsTrigger>
                  <TabsTrigger 
                    value="activities" 
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 pt-2 font-medium"
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Atividades
                  </TabsTrigger>
                </>
              )}
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <TabsContent value="details" className="m-0 h-full outline-none">
              <TicketDetailsTab 
                ticket={ticket} 
                onSave={onSave} 
                onCancel={onClose} 
                onDelete={onDelete}
              />
            </TabsContent>
            
            {ticket && (
              <>
                <TabsContent value="history" className="m-0 h-full outline-none">
                  <TicketHistoryTab currentTicket={ticket} />
                </TabsContent>
                <TabsContent value="activities" className="m-0 h-full outline-none">
                  <TicketActivityTab ticket={ticket} />
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
