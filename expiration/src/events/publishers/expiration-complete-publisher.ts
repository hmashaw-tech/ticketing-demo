import { BasePublisher, Topics, ExpirationCompleteEvent } from '@hvag-tkt/shared'

export class ExpirationCompletePublisher extends BasePublisher<ExpirationCompleteEvent> {
    readonly topic = Topics.ExpirationComplete
}
