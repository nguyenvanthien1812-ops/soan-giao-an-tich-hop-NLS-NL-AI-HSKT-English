import { LicenseInfo, ProPackage } from "../types";

const SECRET_SALT = "NLS_SECRET_PRO_SALT_2026_THIEN";
const DEVICE_ID_KEY = "NLS_DEVICE_ID_V1";
const TRIAL_START_KEY = "NLS_TRIAL_START_TIME_V1";
const PRO_LICENSE_KEY = "NLS_PRO_LICENSE_KEY_V1";
const PRO_PACKAGE_KEY = "NLS_PRO_PACKAGE_KEY_V1";
const PRO_EXPIRY_KEY = "NLS_PRO_EXPIRY_KEY_V1";

// 5 Lượt dùng thử tải về
export const MAX_TRIAL_DOWNLOADS = 5;
const TRIAL_DOWNLOADS_COUNT_KEY = "NLS_TRIAL_DOWNLOADS_COUNT_V2";
const TRIAL_DOWNLOADS_HASH_KEY = "NLS_TRIAL_DOWNLOADS_HASH_V2";

// Simple FNV-1a 32-bit Hash converted to 8-char uppercase hex/alphanumeric
function hashString(str: string): string {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const positiveHash = (hash >>> 0).toString(16).toUpperCase();
  return (positiveHash + "8899AABB").slice(0, 8);
}

// Làm sạch Device ID (loại bỏ dấu gạch ngang, chữ thường -> chữ hoa)
function cleanString(str: string): string {
  return str.replace(/[^A-Z0-9]/gi, "").toUpperCase();
}

// Lấy số lượt tải dùng thử đã dùng (có bảo vệ checksum)
export function getTrialDownloadsUsed(): number {
  const countStr = localStorage.getItem(TRIAL_DOWNLOADS_COUNT_KEY);
  const hashStr = localStorage.getItem(TRIAL_DOWNLOADS_HASH_KEY);
  if (!countStr) return 0;
  
  const count = parseInt(countStr, 10);
  if (isNaN(count) || count < 0) return 0;
  
  // Xác thực checksum chống chỉnh sửa trực tiếp
  const expectedHash = hashString(`${count}:${SECRET_SALT}`);
  if (hashStr !== expectedHash) {
    return MAX_TRIAL_DOWNLOADS; // Nếu bị can thiệp thì khóa lượt dùng thử
  }
  return count;
}

// Ghi nhận 1 lượt tải về thành công
export function recordTrialDownload(): { success: boolean; isPro: boolean; downloadsRemaining: number; isTrialExpired: boolean } {
  const lic = getLicenseInfo();
  if (lic.isPro) {
    return { success: true, isPro: true, downloadsRemaining: 9999, isTrialExpired: false };
  }

  const currentUsed = getTrialDownloadsUsed();
  if (currentUsed >= MAX_TRIAL_DOWNLOADS) {
    return { success: false, isPro: false, downloadsRemaining: 0, isTrialExpired: true };
  }

  const newCount = currentUsed + 1;
  localStorage.setItem(TRIAL_DOWNLOADS_COUNT_KEY, newCount.toString());
  localStorage.setItem(TRIAL_DOWNLOADS_HASH_KEY, hashString(`${newCount}:${SECRET_SALT}`));

  const remaining = Math.max(0, MAX_TRIAL_DOWNLOADS - newCount);
  return {
    success: true,
    isPro: false,
    downloadsRemaining: remaining,
    isTrialExpired: remaining <= 0
  };
}

// 1. Hàm khởi tạo hoặc lấy Mã Thiết Bị độc nhất (Cố định theo Phần cứng Máy tính)
export function getOrCreateDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    // Tạo fingerprint cố định từ cấu hình phần cứng thiết bị (Màn hình + Số nhân CPU + Múi giờ + Hệ điều hành)
    const screenInfo = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
    const cores = navigator.hardwareConcurrency || 4;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Ho_Chi_Minh";
    const platform = (navigator as any).userAgentData?.platform || navigator.platform || "Win32";
    
    const hwFingerprint = `HW-DEVICE-V1:${screenInfo}:${cores}:${tz}:${platform}`;
    const hashHex1 = hashString(hwFingerprint);
    const hashHex2 = hashString(`${hashHex1}:${SECRET_SALT}`);
    
    deviceId = `DEV-${hashHex1.slice(0, 4)}-${hashHex2.slice(0, 4)}`;
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

// 2. Hàm Admin: Sinh mã Kích hoạt Pro dựa trên Device ID và Gói thời hạn
export function generateProKey(deviceId: string, packageType: ProPackage): string {
  const cleanDev = cleanString(deviceId);
  if (!cleanDev) return "";

  let prefix = "PRO-LIFE";
  if (packageType === '1_YEAR') prefix = "PRO-1Y";
  if (packageType === '2_YEARS') prefix = "PRO-2Y";

  const rawPayload = `${prefix}:${cleanDev}:${SECRET_SALT}`;
  const checksum = hashString(rawPayload);

  return `${prefix}-${cleanDev.slice(-6)}-${checksum}`;
}

// 3. Hàm Người dùng: Kiểm tra & Kích hoạt Mã Pro
export function activateProKey(inputKey: string, currentDeviceId: string): { success: boolean; message: string; packageType?: ProPackage; expiryDate?: number } {
  const trimmedKey = inputKey.trim().toUpperCase();
  if (!trimmedKey) {
    return { success: false, message: "Vui lòng nhập Mã Kích Hoạt Pro!" };
  }

  const cleanDev = cleanString(currentDeviceId);

  // Thử kiểm tra khớp với từng gói 1 Năm, 2 Năm, Vĩnh Viễn
  const packages: ProPackage[] = ['LIFETIME', '1_YEAR', '2_YEARS'];
  let matchedPackage: ProPackage | null = null;

  for (const pkg of packages) {
    const expectedKey = generateProKey(currentDeviceId, pkg);
    if (trimmedKey === expectedKey || trimmedKey.replace(/[\s-]/g, "") === expectedKey.replace(/[\s-]/g, "")) {
      matchedPackage = pkg;
      break;
    }
  }

  if (!matchedPackage) {
    return {
      success: false,
      message: "Mã kích hoạt không hợp lệ hoặc không đúng với Mã Thiết Bị này!"
    };
  }

  let expiryTimestamp: number | undefined = undefined;
  const now = Date.now();

  if (matchedPackage === '1_YEAR') {
    expiryTimestamp = now + 365 * 24 * 60 * 60 * 1000;
  } else if (matchedPackage === '2_YEARS') {
    expiryTimestamp = now + 730 * 24 * 60 * 60 * 1000;
  }

  // Lưu vào localStorage
  localStorage.setItem(PRO_LICENSE_KEY, trimmedKey);
  localStorage.setItem(PRO_PACKAGE_KEY, matchedPackage);
  if (expiryTimestamp) {
    localStorage.setItem(PRO_EXPIRY_KEY, expiryTimestamp.toString());
  } else {
    localStorage.removeItem(PRO_EXPIRY_KEY);
  }

  return {
    success: true,
    message: matchedPackage === 'LIFETIME' 
      ? "Kích hoạt thành công Bản Pro Vĩnh Viễn!" 
      : matchedPackage === '1_YEAR'
      ? "Kích hoạt thành công Bản Pro 1 Năm!"
      : "Kích hoạt thành công Bản Pro 2 Năm!",
    packageType: matchedPackage,
    expiryDate: expiryTimestamp
  };
}

// 4. Hàm lấy toàn bộ thông tin Bản quyền & Dùng thử hiện tại
export function getLicenseInfo(): LicenseInfo {
  const deviceId = getOrCreateDeviceId();
  const proKey = localStorage.getItem(PRO_LICENSE_KEY);
  const proPackageStr = localStorage.getItem(PRO_PACKAGE_KEY) as ProPackage | null;
  const expiryStr = localStorage.getItem(PRO_EXPIRY_KEY);

  const now = Date.now();

  // Đã kích hoạt bản Pro
  if (proKey && proPackageStr) {
    let proExpiryDate: number | undefined = undefined;
    if (expiryStr) {
      proExpiryDate = parseInt(expiryStr, 10);
    }

    // Kiểm tra xem gói có thời hạn (1 năm/2 năm) đã hết hạn chưa
    if (!proExpiryDate || now <= proExpiryDate) {
      return {
        deviceId,
        isPro: true,
        packageType: proPackageStr,
        trialStartDate: 0,
        trialDaysRemaining: 0,
        trialDownloadsUsed: 0,
        trialDownloadsRemaining: 9999,
        maxTrialDownloads: MAX_TRIAL_DOWNLOADS,
        isTrialExpired: false,
        proExpiryDate,
        licenseKey: proKey
      };
    }
  }

  // Chế độ Dùng thử 5 Lượt Tải Về
  const trialDownloadsUsed = getTrialDownloadsUsed();
  const trialDownloadsRemaining = Math.max(0, MAX_TRIAL_DOWNLOADS - trialDownloadsUsed);
  const isTrialExpired = trialDownloadsUsed >= MAX_TRIAL_DOWNLOADS;

  return {
    deviceId,
    isPro: false,
    packageType: 'TRIAL',
    trialStartDate: 0,
    trialDaysRemaining: 0,
    trialDownloadsUsed,
    trialDownloadsRemaining,
    maxTrialDownloads: MAX_TRIAL_DOWNLOADS,
    isTrialExpired,
    licenseKey: undefined
  };
}

// 5. Hàm Admin / Test: Xóa bản quyền và đặt lại về dùng thử 5 lượt tải
export function resetLicenseToTrial(): void {
  localStorage.removeItem(PRO_LICENSE_KEY);
  localStorage.removeItem(PRO_PACKAGE_KEY);
  localStorage.removeItem(PRO_EXPIRY_KEY);
  localStorage.removeItem(TRIAL_DOWNLOADS_COUNT_KEY);
  localStorage.removeItem(TRIAL_DOWNLOADS_HASH_KEY);
  localStorage.removeItem(TRIAL_START_KEY);
}
