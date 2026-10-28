import { z } from "zod";

export const otpSendSchema = z
  .object({
    identifier: z.string().min(3).max(120),
    method: z.enum(["email", "phone"]),
  })
  .refine(
    (d) =>
      d.method === "email"
        ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.identifier)
        : /^\d{10}$/.test(d.identifier),
    {
      message: "Invalid email or phone for the chosen method",
      path: ["identifier"],
    },
  );

export const otpVerifySchema = z.object({
  identifier: z.string().min(3),
  method: z.enum(["email", "phone"]),
  otp: z.string().regex(/^\d{6}$/),
});

export const registerSchema = z
  .object({
    name: z.string().min(2).max(60),
    email: z.string().email().optional(),
    phone: z
      .string()
      .regex(/^\d{10}$/)
      .optional(),
    password: z.string().min(6).max(100),
    role: z.enum(["owner", "tenant"]),
    verifiedBy: z.enum(["email", "phone"]),
  })
  .refine((d) => d.email || d.phone, { message: "Email or phone required" })
  .refine((d) => (d.verifiedBy === "email" ? !!d.email : !!d.phone), {
    message: "Verified method must have a value",
    path: ["verifiedBy"],
  });

export const propertySchema = z.object({
  title: z.string().min(5).max(120),
  description: z.string().min(20).max(2000),
  propertyType: z.enum([
    "Room",
    "Flat",
    "Builder Floor",
    "Independent House",
    "Villa",
    "Row House",
    "Studio",
    "Penthouse",
    "Duplex",
    "Home",
  ]),
  bhk: z
    .enum([
      "1RK",
      "1BHK",
      "1.5BHK",
      "2BHK",
      "2.5BHK",
      "3BHK",
      "3.5BHK",
      "4BHK",
      "4+BHK",
    ])
    .optional(),
  furnishing: z
    .enum(["Furnished", "Semi-furnished", "Unfurnished"])
    .default("Unfurnished"),
  bathrooms: z.coerce.number().int().min(1).max(10).default(1),
  parking: z.enum(["None", "Bike", "Car", "Both"]).default("None"),
  preferredTenants: z
    .array(z.enum(["Family", "Bachelors", "Students", "Company"]))
    .default(["Family"]),
  amenities: z.array(z.string().max(50)).max(30).default([]),
  availableFrom: z.string().optional(),
  city: z.string().min(2).max(80),
  rent: z.coerce.number().positive().max(1000000),
  deposit: z.coerce.number().nonnegative().max(10000000).default(0),
  maintenanceCharge: z.coerce.number().nonnegative().max(100000).default(0),
  area: z.string().min(2).max(80),
  address: z.string().min(5).max(300),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  images: z.array(z.string().url()).min(1).max(10),
});

export const messageSchema = z.object({
  conversationId: z.string().min(1),
  text: z.string().max(2000).optional(),
  imageUrl: z.string().url().optional(),
});

export const reviewSchema = z.object({
  propertyId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export const agreementSchema = z.object({
  propertyId: z.string().min(1),

  // Place & Date
  place: z.string().min(2),
  agreementDate: z.string(),

  // Owner
  ownerName: z.string().min(2),
  ownerFatherName: z.string().min(2),
  ownerAddress: z.string().min(5),

  // Tenant
  tenantName: z.string().min(2),
  tenantFatherName: z.string().min(2),
  tenantOfficeOrInstitution: z.string().min(3),
  tenantAddress: z.string().min(5),

  // Property (from DB + manual)
  propertyAddress: z.string().min(5),

  // Lease
  startDate: z.string(),
  expiryDate: z.string(),
  rentAmount: z.coerce.number().positive(),
  maintenanceCharge: z.coerce.number().nonnegative().default(0),
  securityDeposit: z.coerce.number().nonnegative().default(0),
  chequeNumber: z.string().default(""),
  chequeDate: z.string().default(""),
  noticePeriodDays: z.coerce.number().int().min(0).max(180).default(30),
  city: z.string().min(2),

  // Annexure-I
  bedrooms: z.coerce.number().int().min(0).max(20).default(1),
  fans: z.coerce.number().int().min(0).default(0),
  cflLights: z.coerce.number().int().min(0).default(0),
  geysers: z.coerce.number().int().min(0).default(0),
  mirrors: z.coerce.number().int().min(0).default(0),

  // Witnesses
  witness1Name: z.string().min(2),
  witness1Address: z.string().min(5),
  witness2Name: z.string().min(2),
  witness2Address: z.string().min(5),
});
