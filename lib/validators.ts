import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  phone: z.string().regex(/^\d{10}$/).optional(),
  role: z.enum(['owner', 'tenant']),
});

export const propertySchema = z.object({
  title: z.string().min(5).max(120),
  description: z.string().min(20).max(2000),
  propertyType: z.enum(['Room', 'Home', 'Flat']),
  rent: z.coerce.number().positive().max(1000000),
  deposit: z.coerce.number().nonnegative().max(10000000).default(0),
  area: z.string().min(2).max(80),
  address: z.string().min(5).max(300),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  images: z.array(z.string().url()).min(1).max(10),
});

export const messageSchema = z.object({
  conversationId: z.string().min(1),
  text: z.string().min(1).max(2000),
});

export const reviewSchema = z.object({
  propertyId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export const otpSendSchema = z.object({ phone: z.string().regex(/^\d{10}$/) });
export const otpVerifySchema = z.object({
  phone: z.string().regex(/^\d{10}$/),
  otp: z.string().regex(/^\d{6}$/),
});

export const agreementSchema = z.object({
  propertyId: z.string().min(1),
  tenantName: z.string().min(2),
  tenantPhone: z.string().min(10),
  tenantAddress: z.string().min(5),
  startDate: z.string(),
  durationMonths: z.coerce.number().int().min(1).max(120).default(11),
  noticePeriodDays: z.coerce.number().int().min(0).max(180).default(30),
  includeFurniture: z.boolean().default(false),
});