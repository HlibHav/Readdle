export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  hasInternet: boolean;
  processingPower: 'low' | 'medium' | 'high';
  memoryAvailable: number; // in MB
  connectionType: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
  userAgent: string;
  screenSize: {
    width: number;
    height: number;
  };
}

export class DeviceService {
  static detectDevice(userAgent: string, additionalInfo?: any): DeviceInfo {
    const ua = userAgent.toLowerCase();
    
    // Mobile detection
    const isMobile = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua);
    const isTablet = /ipad|android(?!.*mobile)|tablet/i.test(ua);
    const isDesktop = !isMobile && !isTablet;
    
    // Processing power estimation based on device type and user agent
    let processingPower: 'low' | 'medium' | 'high' = 'medium';
    
    if (isMobile) {
      // High-end mobile devices
      if (/iphone|ipad|samsung galaxy|pixel|oneplus/i.test(ua)) {
        processingPower = 'high';
      } else if (/android/i.test(ua)) {
        processingPower = 'medium';
      } else {
        processingPower = 'low';
      }
    } else if (isTablet) {
      processingPower = 'high';
    } else {
      // Desktop - assume high processing power
      processingPower = 'high';
    }
    
    // Memory estimation (rough approximation)
    let memoryAvailable = 1024; // Default 1GB
    if (isMobile) {
      memoryAvailable = processingPower === 'high' ? 4096 : 2048;
    } else if (isTablet) {
      memoryAvailable = 4096;
    } else {
      memoryAvailable = 8192; // 8GB for desktop
    }
    
    // Connection type detection
    let connectionType: 'wifi' | 'cellular' | 'ethernet' | 'unknown' = 'unknown';
    if (additionalInfo?.connectionType) {
      connectionType = additionalInfo.connectionType;
    } else if (isMobile) {
      connectionType = 'cellular';
    } else {
      connectionType = 'wifi';
    }
    
    // Screen size estimation
    const screenSize = {
      width: additionalInfo?.screenWidth || (isMobile ? 375 : isTablet ? 768 : 1920),
      height: additionalInfo?.screenHeight || (isMobile ? 667 : isTablet ? 1024 : 1080)
    };
    
    return {
      isMobile,
      isTablet,
      isDesktop,
      hasInternet: true, // Assume internet is available unless proven otherwise
      processingPower,
      memoryAvailable,
      connectionType,
      userAgent,
      screenSize
    };
  }
  
  static getOptimalRAGStrategy(deviceInfo: DeviceInfo, contentLength: number): string {
    // Strategy selection based on device capabilities and content complexity
    
    if (!deviceInfo.hasInternet) {
      return 'offline';
    }
    
    if (deviceInfo.isMobile && deviceInfo.processingPower === 'low') {
      return 'fast';
    }
    
    if (deviceInfo.isMobile && deviceInfo.processingPower === 'high' && contentLength < 5000) {
      return 'balanced';
    }
    
    if (deviceInfo.isDesktop && deviceInfo.processingPower === 'high' && contentLength > 10000) {
      return 'comprehensive';
    }
    
    if (deviceInfo.connectionType === 'cellular' && deviceInfo.isMobile) {
      return 'fast';
    }
    
    return 'balanced';
  }
  
  static shouldUseLocalProcessing(deviceInfo: DeviceInfo): boolean {
    // Decide whether to use local processing based on device capabilities
    return (
      !deviceInfo.hasInternet ||
      (deviceInfo.isMobile && deviceInfo.processingPower === 'low') ||
      deviceInfo.connectionType === 'cellular'
    );
  }
}
