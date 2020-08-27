import { Topics } from './topics'

export interface TicketCreatedEvent {
    topic: Topics.TicketCreated
    message: {
        id: string
        title: string
        price: number
    }
}
