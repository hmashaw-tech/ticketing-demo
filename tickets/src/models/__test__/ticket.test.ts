import { Ticket } from '../ticket'

it('implements OCC', async (done) => {

    // Create ticket
    const ticket = Ticket.build({
        userId: '123',
        title: 'Movie',
        price: 20
    })

    // Save Ticket
    await ticket.save()

    // Fetch ticket twice
    const firstTicketInstance = await Ticket.findById(ticket.id)
    const secondTicketInstance = await Ticket.findById(ticket.id)

    // Make changes to the fetched tickets
    firstTicketInstance!.set({ price: 15 })
    secondTicketInstance!.set({ price: 25 })

    // Save first fetched ticket
    await firstTicketInstance!.save()

    // Save second fetched ticket - should have outdated version
    // expect(async () => {
    //     await secondTicketInstance!.save()
    // }).toThrow()

    try {
        await secondTicketInstance!.save()
    } catch (error) {
        return done()
    }
    throw new Error('Only here if test failed!')
    
})

it('increments the version number on save', async () => {
    const ticket = Ticket.build({
        userId: '123',
        title: 'Movie',
        price: 20
    })
    await ticket.save()
    expect(ticket.version).toEqual(0)
    await ticket.save()
    expect(ticket.version).toEqual(1)
    await ticket.save()
    expect(ticket.version).toEqual(2)
})
