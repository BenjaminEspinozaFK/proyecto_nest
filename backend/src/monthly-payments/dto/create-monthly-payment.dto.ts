export class CreateMonthlyPaymentDto {
  userId: string;
  year: number;
  month: number; // 1-12
  amount: number;
  description?: string;
}
