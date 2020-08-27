export const natsWrapper = {

    stan: {
        publish: jest
        .fn()
        .mockImplementation((topic: string, message: string, callback: () => void) => {
            callback()
        })
    }

}
