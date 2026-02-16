
import { EmployeeProfile, SecurityCertificate } from "../types";

const CERT_VALIDITY_MS = 365 * 24 * 60 * 60 * 1000; // 1 Year
const PASSWORD_EXPIRY_MS = 60 * 24 * 60 * 60 * 1000; // 60 Days
const HISTORY_LIMIT = 10;

export const SecurityService = {
  
  // --- Certificate Management ---

  generateCertificate: (employeeEmail: string): SecurityCertificate => {
    const now = Date.now();
    return {
      issuedTo: employeeEmail,
      issuedAt: now,
      expiresAt: now + CERT_VALIDITY_MS,
      // Create a pseudo-signature based on data
      signature: btoa(`${employeeEmail}-${now}-P3-SECURE-KEY`)
    };
  },

  // HARDCODED MASTER KEY GENERATOR FOR SUPER ADMIN BOOTSTRAPPING
  getMasterCertificate: (): SecurityCertificate => {
    // Fixed timestamp to ensure the signature matches what we put in Persistence
    // In a real app, this would be generated once offline and stored securely.
    const fixedTime = 1704067200000; // Jan 1 2024
    return {
      issuedTo: 'admin@p3lending.space',
      issuedAt: fixedTime,
      expiresAt: fixedTime + (365 * 24 * 60 * 60 * 1000) * 10, // 10 Year validity for Master
      signature: 'SUPER-ADMIN-MASTER-SIGNATURE-Verification-Token-X99'
    };
  },

  validateCertificate: (uploadedCert: SecurityCertificate, storedEmp: EmployeeProfile): { valid: boolean; error?: string } => {
    if (!storedEmp.certificateData) {
      return { valid: false, error: "No certificate is registered for this account. Contact Admin." };
    }

    // 1. Check Signature Match
    if (uploadedCert.signature !== storedEmp.certificateData.signature) {
      return { valid: false, error: "Invalid Certificate Signature. Access Denied." };
    }

    // 2. Check Expiry
    if (Date.now() > uploadedCert.expiresAt) {
      return { valid: false, error: "Security Certificate Expired. Please request a new one." };
    }

    // 3. Check Owner
    if (uploadedCert.issuedTo !== storedEmp.email) {
      return { valid: false, error: "Certificate owner mismatch." };
    }

    return { valid: true };
  },

  downloadCertificate: (cert: SecurityCertificate) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cert));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `p3_secure_key_${cert.issuedTo}.p3key`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  },

  // --- Password Management ---

  isPasswordExpired: (lastSet: number): boolean => {
    return (Date.now() - lastSet) > PASSWORD_EXPIRY_MS;
  },

  checkPasswordHistory: (newPass: string, history: string[]): boolean => {
    return history.includes(newPass);
  },

  // In a real app, use bcrypt. Here we just return the string for simulation
  hashPassword: (pass: string) => pass 
};
