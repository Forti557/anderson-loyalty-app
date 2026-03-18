export interface UserProfile {
  id: string;
  telegramId: number;
  firstName: string;
  lastName?: string;
  phone?: string;
  level: number;
  levelName: string;
  cashbackPercent: number;
  bonusBalance: number;
  totalSpent: number;
  nextLevelThreshold: number | null;
  homeRestaurant?: string;
  children: ChildInfo[];
  onboardingDone: boolean;
}

export interface ChildInfo {
  id: string;
  name: string;
  birthDate: string;
}

export interface StampCardInfo {
  id: string;
  stampsCount: number;
  completed: boolean;
  giftClaimed: boolean;
  stamps: StampInfo[];
}

export interface StampInfo {
  id: string;
  restaurant?: string;
  amount?: number;
  createdAt: string;
}

export interface TransactionInfo {
  id: string;
  type: "ACCRUAL" | "REDEMPTION" | "BIRTHDAY_BONUS" | "WELCOME_BONUS" | "EXPIRED";
  amount: number;
  bonuses: number;
  description?: string;
  restaurant?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface EventInfo {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  restaurant: string;
  date: string;
  duration: number;
  ageMin?: number;
  ageMax?: number;
  price: number;
  capacity: number;
  bookedCount: number;
  availableSpots: number;
}

export interface EventBookingInfo {
  id: string;
  eventId: string;
  childrenCount: number;
  status: "CONFIRMED" | "CANCELLED";
  event: EventInfo;
}

export interface QrCodeInfo {
  token: string;
  expiresAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
