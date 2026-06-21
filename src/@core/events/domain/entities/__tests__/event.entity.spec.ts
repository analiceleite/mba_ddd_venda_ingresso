import { test, expect } from "@jest/globals"
import { Event } from "../event.entity";
import { PartnerId } from "../partnet.entity";

test('deve criar um evento', () => {
    const event = Event.create({
        name: 'Show do Foo Fighters',
        description: 'Show da banda Foo Fighters em São Paulo',
        is_published: true,
        total_spots: 100,
        total_spots_reserved: 0,
        date: new Date(),
        partner_id: new PartnerId(),
    })

    expect(event).toBeInstanceOf(Event);

    console.log(event.toJSON())
});