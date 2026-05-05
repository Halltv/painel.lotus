import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Send, Paperclip, Search, Check, CheckCheck, RefreshCw, Bot, User, Headphones } from 'lucide-react';
import { useWhatsAppConversations, useWhatsAppMessages } from '@/hooks/useWhatsApp.js';
import { toast } from 'sonner';

const statusConfig = {
  active: { label: 'Ativo', color: 'bg-green-500' },
  transferred: { label: 'Com Operador', color: 'bg-yellow-500' },
  closed: { label: 'Encerrado', color: 'bg-gray-400' },
};

const senderIcon = {
  bot: <Bot className="h-3 w-3" />,
  operator: <Headphones className="h-3 w-3" />,
  user: <User className="h-3 w-3" />,
};

function ConversationItem({ conversation, isSelected, onClick }) {
  const sc = statusConfig[conversation.status] || statusConfig.active;
  const updatedAt = new Date(conversation.updatedAt || conversation.createdAt);
  const timeStr = updatedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const displayName = conversation.contactName || conversation.remoteJid?.split('@')[0] || 'Desconhecido';

  return (
    <div
      onClick={onClick}
      className={`p-4 border-b cursor-pointer transition-colors ${isSelected ? 'bg-muted' : 'hover:bg-muted/50'}`}
    >
      <div className="flex justify-between items-start mb-1">
        <span className="font-medium text-sm truncate pr-2">{displayName}</span>
        <span className="text-xs text-muted-foreground shrink-0">{timeStr}</span>
      </div>
      <div className="flex justify-between items-center gap-2">
        <p className="text-xs text-muted-foreground truncate flex-1">{conversation.remoteJid}</p>
        <div className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full shrink-0 ${sc.color}`} />
          <span className="text-[10px] text-muted-foreground">{sc.label}</span>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }) {
  const isOutbound = message.sender === 'bot' || message.sender === 'operator';
  const time = new Date(message.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}>
      <div className={`
        p-3 max-w-[70%] shadow-sm
        ${isOutbound
          ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-none'
          : 'bg-card border rounded-2xl rounded-tl-none'
        }
      `}>
        {message.sender !== 'user' && (
          <div className={`flex items-center gap-1 text-[10px] mb-1 ${isOutbound ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
            {senderIcon[message.sender]}
            <span>{message.sender === 'bot' ? 'Bot' : 'Operador'}</span>
          </div>
        )}
        <p className="text-sm whitespace-pre-wrap">{message.messageText}</p>
        <div className={`flex items-center justify-end gap-1 mt-1 ${isOutbound ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
          <span className="text-[10px]">{time}</span>
          {isOutbound && (message.isRead ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />)}
        </div>
      </div>
    </div>
  );
}

export default function WhatsApp() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);

  const { conversations, loading: convsLoading, error: convsError, refetch: refetchConvs } = useWhatsAppConversations();
  const { messages, loading: msgsLoading, refetch: refetchMsgs, sendMessage, sending } = useWhatsAppMessages(selectedConversationId);

  const filtered = conversations.filter(c => {
    const name = (c.contactName || c.remoteJid || '').toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto select first conversation
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversationId) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations]);

  const handleSend = async () => {
    if (!messageText.trim() || !selectedConversationId) return;
    const text = messageText.trim();
    setMessageText('');
    try {
      await sendMessage(text);
      refetchMsgs();
    } catch (err) {
      toast.error('Erro ao enviar mensagem: ' + err.message);
      setMessageText(text);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const displayName = selectedConversation?.contactName || selectedConversation?.remoteJid?.split('@')[0] || '';
  const sc = statusConfig[selectedConversation?.status] || statusConfig.active;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[calc(100vh-8rem)] flex gap-4">
      {/* Sidebar */}
      <Card className="w-80 flex flex-col overflow-hidden shrink-0">
        <div className="p-4 border-b space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Lotus Zap Zap</h2>
            <Button variant="ghost" size="icon" onClick={refetchConvs} title="Atualizar">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar conversas..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {convsLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 border-b space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))
          ) : convsError ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              <p className="text-destructive mb-2">{convsError}</p>
              <p className="text-xs">Configure uma instância WhatsApp nas configurações para começar.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {conversations.length === 0
                ? 'Nenhuma conversa ainda. Configure sua instância WhatsApp nas configurações.'
                : 'Nenhuma conversa encontrada.'}
            </div>
          ) : (
            filtered.map(conv => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isSelected={conv.id === selectedConversationId}
                onClick={() => setSelectedConversationId(conv.id)}
              />
            ))
          )}
        </div>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{displayName}</h3>
                <p className="text-xs text-muted-foreground">{selectedConversation.remoteJid}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={refetchMsgs} title="Atualizar mensagens">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <span className={`w-2 h-2 rounded-full ${sc.color}`} />
                <Badge variant="outline" className="text-xs">{sc.label}</Badge>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
              {msgsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                    <Skeleton className="h-12 w-48 rounded-2xl" />
                  </div>
                ))
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  Nenhuma mensagem nesta conversa ainda.
                </div>
              ) : (
                messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t bg-card flex gap-2 items-center">
              <Button variant="outline" size="icon" className="shrink-0">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Input
                placeholder="Digite sua mensagem..."
                className="flex-1"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={sending}
              />
              <Button size="icon" className="shrink-0" onClick={handleSend} disabled={!messageText.trim() || sending}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-2">
            <p>Selecione uma conversa para iniciar</p>
            {conversations.length === 0 && !convsLoading && (
              <p className="text-sm text-center max-w-xs">
                Nenhuma conversa disponível. Configure uma instância WhatsApp nas
                <span className="text-primary font-medium"> Configurações</span>.
              </p>
            )}
          </div>
        )}
      </Card>
    </motion.div>
  );
}
