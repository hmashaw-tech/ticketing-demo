import { Message } from 'node-nats-streaming'

import { BasePublisher } from './base-publisher'
import { TicketCreatedEvent } from './ticket-created-event'
import { Topics } from './topics'

export class TicketCreatedPublisher extends BasePublisher<TicketCreatedEvent> {
    readonly topic = Topics.TicketCreated
}
