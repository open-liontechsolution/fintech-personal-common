/**
 * Financial DTOs
 * These interfaces define the data structures for financial objects
 * used across microservices.
 */

/**
 * Account DTO - Represents a financial account
 */
export interface AccountDto {
  id: string;
  userId: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment';
  balance: number;
  currency: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Category DTO - Represents a transaction category
 */
export interface CategoryDto {
  id: string;
  userId?: string; // Null for system categories
  name: string;
  type: 'income' | 'expense' | 'transfer';
  color?: string;
  icon?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Subcategory DTO - Represents a transaction subcategory
 */
export interface SubcategoryDto {
  id: string;
  categoryId: string;
  userId?: string; // Null for system subcategories
  name: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Transaction DTO - Represents a financial transaction
 */
export interface TransactionDto {
  id: string;
  userId: string;
  accountId: string;
  categoryId?: string;
  subcategoryId?: string;
  amount: number;
  date: string;
  description?: string;
  notes?: string;
  isRecurring: boolean;
  createdAt: string;
  updatedAt: string;
  importId?: string;
}

/**
 * Budget DTO - Represents a budget
 */
export interface BudgetDto {
  id: string;
  userId: string;
  categoryId?: string;
  name: string;
  amount: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Dashboard Summary DTO - Summary data for the dashboard
 */
export interface DashboardSummaryDto {
  accounts: AccountSummaryDto[];
  recentTransactions: TransactionSummaryDto[];
  monthlySpending: MonthlySummaryDto[];
  alerts: AlertDto[];
}

/**
 * Account Summary DTO - Simplified account information for dashboard
 */
export interface AccountSummaryDto {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment';
  balance: number;
  currency: string;
}

/**
 * Transaction Summary DTO - Simplified transaction for dashboard
 */
export interface TransactionSummaryDto {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  accountId: string;
}

/**
 * Monthly Summary DTO - Monthly financial summary
 */
export interface MonthlySummaryDto {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

/**
 * Alert DTO - System alerts and notifications
 */
export interface AlertDto {
  id: string;
  type: 'warning' | 'info' | 'success';
  message: string;
  createdAt: string;
  read: boolean;
}
