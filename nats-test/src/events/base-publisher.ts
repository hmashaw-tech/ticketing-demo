import { Stan, Message } from 'node-nats-streaming'
import { Topics } from './topics'

interface Event {
    topic: Topics,
    message: any
}

export abstract class BasePublisher<T extends Event> {

    abstract topic: T['topic']
    private stan: Stan

    constructor(stan: Stan) {
        this.stan = stan
    }

    publish(message: T['message']): Promise<void> {

        return new Promise((resolve, reject) => {
            this.stan.publish(this.topic, JSON.stringify(message), (err) => {
                if (err) {
                    return reject(err)
                }
                console.log('Message published to Topic:', this.topic)
                resolve()
            })
        })

        
    }

}
