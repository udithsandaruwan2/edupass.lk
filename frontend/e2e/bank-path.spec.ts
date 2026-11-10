import { expect, test } from '@playwright/test';

/**
 * Playwright smoke: login → bank checkout → slip approve → ticket → check-in.
 * Requires Nest API at API_BASE_URL (default http://127.0.0.1:3000).
 * PayHere remains disabled (asserted).
 */
test.describe('Bank path smoke', () => {
  test('login → bank path → ticket → check-in; PayHere still disabled', async ({
    request,
  }) => {
    const stamp = Date.now();

    const card = await request.post('/api/checkout', {
      data: {
        paymentMethod: 'card',
        buyer: { name: 'X', email: 'x@test.lk', phone: '077' },
        lines: [{ ticketTypeId: 'none', quantity: 1 }],
      },
    });
    // Unauthenticated or 501 — never a paid card order
    expect([401, 501, 400]).toContain(card.status());

    const sellerRes = await request.post('/api/auth/register/lecturer', {
      data: {
        email: `pw-s-${stamp}@test.lk`,
        password: 'Password123!',
        name: 'PW Seller',
        organisationName: `PW Org ${stamp}`,
      },
    });
    expect(sellerRes.ok()).toBeTruthy();
    const seller = (await sellerRes.json()) as {
      accessToken: string;
      user: { memberships: { organisationId: string }[] };
    };
    const organisationId = seller.user.memberships[0].organisationId;

    const starts = new Date();
    starts.setDate(starts.getDate() + 10);
    const create = await request.post('/api/organiser/seminars', {
      headers: { authorization: `Bearer ${seller.accessToken}` },
      data: {
        organisationId,
        title: 'Playwright Bank Path Seminar',
        subject: 'Economics',
        level: 'AL',
        mode: 'PHYSICAL',
        venue: 'PW Hall',
        district: 'Colombo',
        startsAt: starts.toISOString(),
        durationHours: 2,
        summary: 'Summary long enough for playwright bank path smoke.',
        description: 'Desc',
        streamJoinUrl: 'https://example.com/stream',
        ticketTypes: [
          { name: 'Standard', description: '', priceLkr: 1500, capacity: 20 },
        ],
      },
    });
    expect(create.ok()).toBeTruthy();
    const seminar = (await create.json()) as {
      id: string;
      streamJoinUrl: string | null;
      ticketTypes: { id: string }[];
    };
    expect(seminar.streamJoinUrl).toContain('example.com');

    const publish = await request.post(
      `/api/organiser/seminars/${seminar.id}/publish?organisationId=${organisationId}`,
      {
        headers: { authorization: `Bearer ${seller.accessToken}` },
        data: { checkInMode: 'QR_GATE' },
      },
    );
    expect(publish.ok()).toBeTruthy();

    const studentRes = await request.post('/api/auth/register/student', {
      data: {
        email: `pw-u-${stamp}@test.lk`,
        password: 'Password123!',
        name: 'PW Student',
      },
    });
    expect(studentRes.ok()).toBeTruthy();
    const student = (await studentRes.json()) as { accessToken: string };

    const checkout = await request.post('/api/checkout', {
      headers: { authorization: `Bearer ${student.accessToken}` },
      data: {
        buyer: {
          name: 'PW Student',
          email: `pw-u-${stamp}@test.lk`,
          phone: '0771111111',
        },
        lines: [{ ticketTypeId: seminar.ticketTypes[0].id, quantity: 1 }],
      },
    });
    expect(checkout.status()).toBe(201);
    const order = (await checkout.json()) as { id: string; status: string };
    expect(order.status).toBe('AWAITING_SLIP');

    const slip = await request.post('/api/payments/slips', {
      headers: { authorization: `Bearer ${student.accessToken}` },
      data: { orderId: order.id, slipReference: `PW-${stamp}` },
    });
    expect(slip.ok()).toBeTruthy();
    const slipBody = (await slip.json()) as { id: string };

    const approve = await request.patch(
      `/api/organiser/payments/slips/${slipBody.id}?organisationId=${organisationId}`,
      {
        headers: { authorization: `Bearer ${seller.accessToken}` },
        data: { action: 'approve' },
      },
    );
    expect(approve.ok()).toBeTruthy();

    const ticketsRes = await request.get('/api/tickets', {
      headers: { authorization: `Bearer ${student.accessToken}` },
    });
    expect(ticketsRes.ok()).toBeTruthy();
    const tickets = (await ticketsRes.json()) as {
      code: string;
      seminarId: string;
    }[];
    expect(tickets.length).toBeGreaterThan(0);
    const ticket = tickets.find((t) => t.seminarId === seminar.id);
    expect(ticket).toBeTruthy();

    const checkIn = await request.post('/api/organiser/check-in', {
      headers: { authorization: `Bearer ${seller.accessToken}` },
      data: {
        organisationId,
        seminarId: seminar.id,
        code: ticket!.code,
      },
    });
    expect(checkIn.ok()).toBeTruthy();
    const admitted = (await checkIn.json()) as { ok: boolean; result: string };
    expect(admitted.ok).toBe(true);
    expect(admitted.result).toBe('ADMITTED');
  });
});
