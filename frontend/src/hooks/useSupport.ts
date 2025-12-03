/**
 * useSupport - Custom hook for support ticket management
 */

import { useState, useCallback } from 'react';
import { SupportTicket } from '../types/interface';
import { generateTicketId } from '../utils/utils';

export function useSupport(initialTickets: SupportTicket[] = []) {
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(initialTickets);

  const handleSubmitTicket = useCallback((subject: string, message: string, category: string) => {
    const truncatedMessage = message ? `${message.slice(0, 60)}${message.length > 60 ? '…' : ''}` : '';
    const formattedSubject = `[${category}] ${subject}${truncatedMessage ? ` - ${truncatedMessage}` : ''}`;
    const newTicket: SupportTicket = {
      id: generateTicketId(supportTickets.length),
      subject: formattedSubject,
      status: 'open',
      priority: 'medium',
      createdAt: new Date().toISOString().split('T')[0],
      lastUpdate: new Date().toISOString().split('T')[0]
    };
    setSupportTickets(prev => [newTicket, ...prev]);
  }, [supportTickets.length]);

  return {
    supportTickets,
    setSupportTickets,
    handleSubmitTicket,
  };
}

