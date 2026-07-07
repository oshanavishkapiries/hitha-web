export type Specialization =
  | 'Counselor'
  | 'Clinical Counselor'
  | 'Psychologist'
  | 'Clinical Psychologist'
  | 'Medical Officer (Psychiatry Diploma)'
  | 'Consultant Psychiatrist';

export interface FilterParams {
  name?: string;
  category?: Specialization | '';
  language?: string;
  gender?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
}

export interface Appointment {
  id: string;
  referenceCode: string;
  doctorId: string;
  doctorName: string;
  doctorPicture: string;
  timeRange: string;
  price: number;
  duration: number;
  nickname: string;
  contactMethod: string;
  dateBooked: string;
}

