import mongoose, { Schema, models } from 'mongoose';

const RentAgreementSchema = new Schema({
  property: { type: Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tenant: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },

  details: {
    place: String,
    agreementDate: Date,
    ownerName: String,
    ownerFatherName: String,
    ownerAddress: String,
    tenantName: String,
    tenantFatherName: String,
    tenantOfficeOrInstitution: String,
    tenantAddress: String,
    propertyAddress: String,
    startDate: Date,
    expiryDate: Date,
    rentAmount: Number,
    maintenanceCharge: Number,
    securityDeposit: Number,
    chequeNumber: String,
    chequeDate: Date,
    noticePeriodDays: Number,
    city: String,
    bedrooms: Number,
    fans: Number,
    cflLights: Number,
    geysers: Number,
    mirrors: Number,
    witness1Name: String,
    witness1Address: String,
    witness2Name: String,
    witness2Address: String,
  },

  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected', 'cancelled'],
    default: 'pending',
    index: true,
  },

  tenantConfirmedAt: Date,
  tenantRejectionReason: String,
  ownerCancelledAt: Date,
  pdfUrl: String,

  createdAt: { type: Date, default: Date.now },
});

RentAgreementSchema.index({ owner: 1, status: 1, createdAt: -1 });
RentAgreementSchema.index({ tenant: 1, status: 1, createdAt: -1 });

export const RentAgreement =
  models.RentAgreement || mongoose.model('RentAgreement', RentAgreementSchema);