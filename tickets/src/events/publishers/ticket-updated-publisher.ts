import { BasePublisher, Topics, TicketUpdatedEvent } from '@hvag-tkt/shared'

export class TicketUpdatedPublisher extends BasePublisher<TicketUpdatedEvent> {
    readonly topic = Topics.TicketUpdated
}
