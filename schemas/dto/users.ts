/**
 * User-related DTOs
 * These interfaces define the data structures for user-related objects
 * used across microservices.
 */

/**
 * User DTO - Represents a user in the system
 */
export interface UserDto {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * User Registration DTO - Used for registering new users
 */
export interface UserRegistrationDto {
  name: string;
  email: string;
  password: string;
}

/**
 * User Login DTO - Used for authenticating users
 */
export interface UserLoginDto {
  email: string;
  password: string;
}

/**
 * Auth Response DTO - Response after successful authentication
 */
export interface AuthResponseDto {
  token: string;
  user: UserDto;
}

/**
 * User Profile Update DTO - Used for updating user profiles
 */
export interface UserProfileUpdateDto {
  name?: string;
  email?: string;
  password?: string;
}

/**
 * User Settings DTO - User preferences and settings
 */
export interface UserSettingDto {
  id: string;
  userId: string;
  settingKey: string;
  settingValue: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * User Setting Update DTO - For updating user settings
 */
export interface UserSettingUpdateDto {
  settingKey: string;
  settingValue: string;
}
