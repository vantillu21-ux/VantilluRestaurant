import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { sendSuccess, sendError } from '../../utils/response';

// Create Table Booking (Public)
export const createReservation = async (req: Request, res: Response) => {
  try {
    const { guestName, guestPhone, guestEmail, guestCount, bookingDate, bookingTime, specialNotes } = req.body;

    const reservation = await prisma.reservation.create({
      data: {
        guestName,
        guestPhone,
        guestEmail,
        guestCount: Number(guestCount) || 2,
        bookingDate: new Date(bookingDate),
        bookingTime,
        specialNotes,
        status: 'PENDING',
      },
    });

    return sendSuccess(res, 'Table reservation request submitted', reservation, 201);
  } catch (error) {
    return sendError(res, 'Failed to submit reservation', 500, error);
  }
};

// Create Party Catering Inquiry (Public)
export const createPartyInquiry = async (req: Request, res: Response) => {
  try {
    const { name, phone, eventType, eventDate, guestCount, budget, requirements } = req.body;

    const partyOrder = await prisma.partyOrder.create({
      data: {
        name,
        phone,
        eventType: eventType || 'Corporate',
        eventDate: new Date(eventDate),
        guestCount: Number(guestCount) || 20,
        budget: budget ? Number(budget) : null,
        requirements,
        status: 'INQUIRY',
      },
    });

    return sendSuccess(res, 'Party catering inquiry submitted', partyOrder, 201);
  } catch (error) {
    return sendError(res, 'Failed to submit party inquiry', 500, error);
  }
};

// List Reservations (Admin)
export const getReservations = async (req: Request, res: Response) => {
  try {
    const reservations = await prisma.reservation.findMany({
      orderBy: { bookingDate: 'desc' },
    });
    return sendSuccess(res, 'Reservations fetched', reservations);
  } catch (error) {
    return sendError(res, 'Failed to fetch reservations', 500, error);
  }
};

// List Party Orders (Admin)
export const getPartyOrders = async (req: Request, res: Response) => {
  try {
    const partyOrders = await prisma.partyOrder.findMany({
      orderBy: { eventDate: 'desc' },
    });
    return sendSuccess(res, 'Party orders fetched', partyOrders);
  } catch (error) {
    return sendError(res, 'Failed to fetch party orders', 500, error);
  }
};
