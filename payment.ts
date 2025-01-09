import { Encryption } from './encryption';

interface PaymentMethod {
  id: string;
  type: 'credit' | 'debit' | 'bank';
  last4: string;
  expiryMonth?: string;
  expiryYear?: string;
}

interface PaymentTransaction {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
  paymentMethodId: string;
  metadata: Record<string, any>;
}

export class PaymentProcessor {
  private static instance: PaymentProcessor;
  private encryptionKey: string;
  private auditLog: any[] = [];

  private constructor() {
    this.encryptionKey = crypto.randomUUID();
    this.setupAuditLog();
  }

  static getInstance(): PaymentProcessor {
    if (!PaymentProcessor.instance) {
      PaymentProcessor.instance = new PaymentProcessor();
    }
    return PaymentProcessor.instance;
  }

  private setupAuditLog() {
    // Initialize IndexedDB for audit logging
    const request = indexedDB.open('paymentAudit', 1);
    
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      const store = db.createObjectStore('auditLog', { keyPath: 'timestamp' });
      store.createIndex('transactionId', 'transactionId', { unique: false });
    };
  }

  private async logAudit(action: string, details: any) {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      action,
      details,
      userId: 'current-user-id', // Should be obtained from auth context
      ipAddress: await this.getClientIP(),
      userAgent: navigator.userAgent
    };

    // Store in IndexedDB
    const request = indexedDB.open('paymentAudit', 1);
    request.onsuccess = (event: any) => {
      const db = event.target.result;
      const transaction = db.transaction(['auditLog'], 'readwrite');
      const store = transaction.objectStore('auditLog');
      store.add(auditEntry);
    };

    // Also keep in memory for immediate access
    this.auditLog.push(auditEntry);
  }

  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      return 'unknown';
    }
  }

  async addPaymentMethod(paymentDetails: {
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    billingAddress: any;
  }): Promise<PaymentMethod> {
    // Validate input
    this.validatePaymentInput(paymentDetails);

    // Encrypt sensitive data
    const encryptedCard = await Encryption.encrypt(
      paymentDetails.cardNumber,
      this.encryptionKey
    );

    // Create payment method
    const paymentMethod: PaymentMethod = {
      id: crypto.randomUUID(),
      type: this.detectCardType(paymentDetails.cardNumber),
      last4: paymentDetails.cardNumber.slice(-4),
      expiryMonth: paymentDetails.expiryMonth,
      expiryYear: paymentDetails.expiryYear
    };

    // Log the action
    await this.logAudit('ADD_PAYMENT_METHOD', {
      paymentMethodId: paymentMethod.id,
      type: paymentMethod.type
    });

    return paymentMethod;
  }

  private validatePaymentInput(details: any) {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // Card number validation (Luhn algorithm)
    if (!this.validateLuhn(details.cardNumber)) {
      throw new Error('Invalid card number');
    }

    // Expiry date validation
    const expYear = parseInt(details.expiryYear);
    const expMonth = parseInt(details.expiryMonth);

    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      throw new Error('Card has expired');
    }

    // CVV validation
    if (!/^\d{3,4}$/.test(details.cvv)) {
      throw new Error('Invalid CVV');
    }
  }

  private validateLuhn(cardNumber: string): boolean {
    const digits = cardNumber.replace(/\D/g, '');
    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  private detectCardType(cardNumber: string): 'credit' | 'debit' {
    // Simplified card type detection
    const firstDigit = cardNumber.charAt(0);
    return ['3', '4', '5'].includes(firstDigit) ? 'credit' : 'debit';
  }

  async processPayment(amount: number, paymentMethodId: string, metadata: any = {}): Promise<PaymentTransaction> {
    // Create transaction record
    const transaction: PaymentTransaction = {
      id: crypto.randomUUID(),
      amount,
      currency: 'USD',
      status: 'pending',
      timestamp: new Date().toISOString(),
      paymentMethodId,
      metadata
    };

    try {
      // Process payment (mock implementation)
      await this.simulatePaymentProcessing();

      // Update transaction status
      transaction.status = 'completed';

      // Log the successful transaction
      await this.logAudit('PROCESS_PAYMENT', {
        transactionId: transaction.id,
        amount,
        status: 'completed'
      });

      return transaction;
    } catch (error) {
      // Update transaction status
      transaction.status = 'failed';

      // Log the failed transaction
      await this.logAudit('PROCESS_PAYMENT', {
        transactionId: transaction.id,
        amount,
        status: 'failed',
        error: error.message
      });

      throw error;
    }
  }

  private async simulatePaymentProcessing(): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate 90% success rate
        if (Math.random() > 0.1) {
          resolve();
        } else {
          reject(new Error('Payment processing failed'));
        }
      }, 1000);
    });
  }

  async getAuditLog(filters: any = {}): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('paymentAudit', 1);

      request.onsuccess = (event: any) => {
        const db = event.target.result;
        const transaction = db.transaction(['auditLog'], 'readonly');
        const store = transaction.objectStore('auditLog');
        const logs: any[] = [];

        store.openCursor().onsuccess = (event: any) => {
          const cursor = event.target.result;
          if (cursor) {
            if (this.matchesFilters(cursor.value, filters)) {
              logs.push(cursor.value);
            }
            cursor.continue();
          } else {
            resolve(logs);
          }
        };
      };

      request.onerror = () => reject(new Error('Failed to retrieve audit log'));
    });
  }

  private matchesFilters(entry: any, filters: any): boolean {
    return Object.entries(filters).every(([key, value]) => {
      if (key === 'dateRange') {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= value.start && entryDate <= value.end;
      }
      return entry[key] === value;
    });
  }
}