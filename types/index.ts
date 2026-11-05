import { Types } from 'mongoose';
export type Role = 'owner' | 'tenant' | 'admin' | 'management_team';
export type PropertyStatus = 'pending' | 'approved' | 'rejected' | 'rented';
export type AgreementStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled';

export interface ApiSuccess<T> {
  data: T;
}

export interface ApiFailure {
  error: string;
  details?: unknown;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export interface AgreementParticipant {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface AgreementProperty {
  _id: string;
  title: string;
  images?: string[];
  area?: string;
  city?: string;
}

export interface RentAgreementSummary {
  _id: string;
  owner: AgreementParticipant | string;
  tenant: AgreementParticipant | string;
  property: AgreementProperty | string | null;
  details?: {
    rentAmount?: number;
    startDate?: string | Date;
  };
  status: AgreementStatus;
  createdAt: string | Date;
  pdfUrl?: string;
}

export interface AgreementListResponse {
  asOwner: RentAgreementSummary[];
  asTenant: RentAgreementSummary[];
}

export interface NotificationItem {
  _id: string;
  type: string;
  title: string;
  body?: string;
  link?: string;
  read: boolean;
  createdAt: string | Date;
}

export interface NotificationListResponse {
  items: NotificationItem[];
  unread: number;
}

export interface SavedSearchItem {
  _id: string;
  name: string;
  filters: Record<string, string>;
  notifyOnNew: boolean;
  lastNotifiedAt?: string | Date;
}

export interface PropertySummary {
  _id: string;
  title: string;
  area?: string;
  city?: string;
  bhk?: string;
  propertyType?: string;
  rent?: number;
  images?: string[];
  featured?: boolean;
  verified?: boolean;
  views?: number;
  createdAt?: string | Date;
  lastAvailabilityConfirmedAt?: string | Date;
  reportCount?: number;
  scamWarnings?: string[];
  owner?: string | { responseLabel?: string };
  location?: {
    coordinates: [number, number];
  };
}

export type PropertyMapItem = Pick<
  PropertySummary,
  "_id" | "title" | "rent" | "images" | "location"
>;

export interface IUser { _id: Types.ObjectId; name: string; email: string; phone?: string; role: Role; phoneVerified: boolean; kycStatus: 'none' | 'pending' | 'verified' | 'rejected'; createdAt: Date; }
export interface IProperty { _id: Types.ObjectId; title: string; description: string; propertyType: 'Room' | 'Home' | 'Flat'; rent: number; deposit: number; area: string; address: string; location: { type: 'Point'; coordinates: [number, number] }; images: string[]; owner: Types.ObjectId; status: PropertyStatus; featured: boolean; createdAt: Date; }