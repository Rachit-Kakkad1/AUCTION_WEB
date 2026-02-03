export interface Student {
  id: string;
  grNumber: string;
  name: string;
  status: 'available' | 'sold' | 'unsold';
  soldTo?: string;
  soldPrice?: number;
}

export interface Vanguard {
  id: string;
  name: string;
  color: string;
  budget: number;
  spent: number;
  squad: Student[];
  leader?: string;
}

export interface AuctionState {
  currentStudentIndex: number;
  isActive: boolean;
  bidAmount: number;
  selectedVanguard: string | null;
}
