export interface Prize {
  id?: number;
  name: string;
  description?: string;
  imageUrl?: string;
  assignedUserId?: number;
  assignedUserFirstName?: string;
  assignedUserLastName?: string;
}

export interface PrizeAssignment {
  prizeId: number;
  userId?: number;
}
