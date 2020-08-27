import { BasePublisher, Topics, TicketCreatedEvent } from '@hvag-tkt/shared'

export class TicketCreatedPublisher extends BasePublisher<TicketCreatedEvent> {
    readonly topic = Topics.TicketCreated
}
