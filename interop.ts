// Healthcare Interoperability Service
export class HealthcareInterop {
  private static instance: HealthcareInterop;
  private connectedDevices: Set<string> = new Set();
  private deviceDataBuffer: Map<string, any[]> = new Map();

  private constructor() {
    // Private constructor for singleton pattern
  }

  static getInstance(): HealthcareInterop {
    if (!HealthcareInterop.instance) {
      HealthcareInterop.instance = new HealthcareInterop();
    }
    return HealthcareInterop.instance;
  }

  async connectBluetoothDevice(): Promise<void> {
    if (!navigator.bluetooth) {
      throw new Error('Bluetooth is not supported in this browser');
    }

    try {
      // Request device with specific services
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ['health_thermometer'] },
          { services: ['heart_rate'] },
          { services: ['blood_pressure'] }
        ],
        optionalServices: [
          '0000180d-0000-1000-8000-00805f9b34fb', // Heart Rate Service
          '00001810-0000-1000-8000-00805f9b34fb', // Blood Pressure Service
          '0000180a-0000-1000-8000-00805f9b34fb'  // Device Information Service
        ]
      });

      if (!device) {
        throw new Error('No device selected');
      }

      // Connect to the device
      const server = await device.gatt?.connect();
      if (!server) {
        throw new Error('Failed to connect to device');
      }

      // Add disconnect listener
      device.addEventListener('gattserverdisconnected', () => {
        this.handleDisconnect(device.id);
      });

      // Add to connected devices
      this.connectedDevices.add(device.id);

      // Initialize data buffer for this device
      this.deviceDataBuffer.set(device.id, []);

    } catch (error: any) {
      // Handle specific error cases
      if (error.name === 'NotFoundError') {
        if (error.message.includes('User cancelled')) {
          throw new Error('Device selection was cancelled');
        }
        throw new Error('No compatible medical devices found. Please make sure your device is turned on and in pairing mode.');
      } else if (error.name === 'SecurityError') {
        throw new Error('Bluetooth permission denied. Please allow access to Bluetooth devices');
      } else if (error.name === 'NetworkError') {
        throw new Error('Unable to connect to the device. Please try again');
      } else if (error.message === '{}' || !error.message) {
        throw new Error('Connection failed. Please make sure your device is turned on and in range');
      } else {
        throw new Error(error.message || 'Failed to connect to device');
      }
    }
  }

  private handleDisconnect(deviceId: string): void {
    this.connectedDevices.delete(deviceId);
    this.deviceDataBuffer.delete(deviceId);
    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('deviceDisconnected', { detail: { deviceId } }));
  }

  getConnectedDevices(): Set<string> {
    return this.connectedDevices;
  }

  disconnectDevice(deviceId: string): void {
    this.handleDisconnect(deviceId);
  }

  disconnectAllDevices(): void {
    this.connectedDevices.clear();
    this.deviceDataBuffer.clear();
  }
}