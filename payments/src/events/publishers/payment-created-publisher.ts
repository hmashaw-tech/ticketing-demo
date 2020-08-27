import { BasePublisher, Topics, PaymentCreatedEvent } from '@hvag-tkt/shared'

export class PaymentCreatedPublisher extends BasePublisher<PaymentCreatedEvent> {
    readonly topic = Topics.PaymentCreated
}
