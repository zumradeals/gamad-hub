import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PortalMessagesRepository } from './portal-messages.repository';

@Injectable()
export class PortalMessagesService {
  constructor(private readonly repo: PortalMessagesRepository) {}

  getInbox(gamadId: string) {
    return this.repo.findReceived(gamadId);
  }

  getSent(gamadId: string) {
    return this.repo.findSent(gamadId);
  }

  countUnread(gamadId: string) {
    return this.repo.countUnread(gamadId);
  }

  async getMessage(id: string, gamadId: string) {
    const msg = await this.repo.findById(id);
    if (!msg) throw new NotFoundException('Message introuvable');
    if (msg.recipientId !== gamadId && msg.senderId !== gamadId) {
      throw new ForbiddenException('Accès refusé');
    }
    if (msg.recipientId === gamadId && msg.status === 'SENT') {
      await this.repo.markRead(id);
    }
    return msg;
  }

  async send(senderGamadId: string, recipientPublicCode: string, content: string) {
    const recipient = await this.repo.findRecipientByPublicCode(recipientPublicCode);
    if (!recipient) throw new NotFoundException('Destinataire introuvable');
    if (recipient.id === senderGamadId) throw new ForbiddenException('Impossible de s\'envoyer un message');
    return this.repo.send(senderGamadId, recipient.id, content);
  }
}
