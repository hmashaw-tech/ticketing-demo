import { Stan, Message } from 'node-nats-streaming'
import { Topics } from './topics'

interface Event {
    topic: Topics
    message: any
}

export abstract class BaseListener<T extends Event> {

    abstract topic: T['topic']
    abstract queueGroupName: string
    abstract onMessage(message: T['message'], msg: Message): void

    private stan: Stan
    protected ackWait = 5000

    constructor( stan: Stan) {
        this.stan = stan
    }

    subscriptionOptions() {
        return this.stan
        .subscriptionOptions()
        .setDeliverAllAvailable()
        .setManualAckMode(true)
        .setAckWait(this.ackWait)
        .setDurableName(this.queueGroupName)
    }

    listen() {
        const subscription = this.stan.subscribe(
            this.topic,
            this.queueGroupName,
            this.subscriptionOptions()
        )

        subscription.on('message', (msg: Message) => {
            console.log(`Message received: ${this.topic} / ${this.queueGroupName}}`)
            const parsedMessage = this.parseMessage(msg)
            this.onMessage(parsedMessage, msg)
        })
    }

    parseMessage(msg: Message) {
        const data = msg.getData()
        return typeof data === 'string'
        ? JSON.parse(data)
        : JSON.parse(data.toString('utf8'))
    }

}
