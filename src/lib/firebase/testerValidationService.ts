import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './config';

/**
 * Service to validate if an email is allowed for tester access
 */
export class TesterValidationService {
  private static instance: TesterValidationService;
  private allowedEmailsCollection = collection(db, 'allowedEmails');

  static getInstance(): TesterValidationService {
    if (!TesterValidationService.instance) {
      TesterValidationService.instance = new TesterValidationService();
    }
    return TesterValidationService.instance;
  }

  /**
   * Check if an email is in the allowed testers list
   * @param email - Email address to validate
   * @returns Promise<boolean> - true if email is allowed, false otherwise
   */
  async isEmailAllowed(email: string): Promise<boolean> {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      
      console.log('🔍 Checking email access:', normalizedEmail);
      
      const q = query(
        this.allowedEmailsCollection,
        where('email', '==', normalizedEmail),
        where('active', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      const isAllowed = !querySnapshot.empty;
      
      console.log('✅ Email access result:', { email: normalizedEmail, allowed: isAllowed });
      
      return isAllowed;
    } catch (error) {
      console.error('❌ Error checking email access:', error);
      // In case of error, deny access for security
      return false;
    }
  }

  /**
   * Validate email and return appropriate error message
   * @param email - Email address to validate
   * @returns Promise<{isValid: boolean, message?: string}>
   */
  async validateTesterEmail(email: string): Promise<{isValid: boolean, message?: string}> {
    try {
      const isAllowed = await this.isEmailAllowed(email);
      
      if (!isAllowed) {
        return {
          isValid: false,
          message: 'This platform is only available to our loyal testers! Please contact support if you believe this is an error.'
        };
      }
      
      return { isValid: true };
    } catch (error) {
      console.error('❌ Error validating tester email:', error);
      return {
        isValid: false,
        message: 'Unable to verify access. Please try again later.'
      };
    }
  }

  /**
   * Get total count of allowed emails (for admin purposes)
   */
  async getAllowedEmailsCount(): Promise<number> {
    try {
      const q = query(
        this.allowedEmailsCollection,
        where('active', '==', true)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      console.error('❌ Error getting allowed emails count:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const testerValidationService = TesterValidationService.getInstance();