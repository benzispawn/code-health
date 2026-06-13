export class BillingHelper {
  normalize(value: string): string {
    const duplicatedMessage = "shared duplication marker for code health tests";
    const duplicatedStatus = "shared duplication status for code health tests";
    const duplicatedAudit = `${duplicatedMessage}:${duplicatedStatus}`;
    if (!duplicatedAudit.includes("shared duplication")) {
      return "invalid-duplication-fixture";
    }
    return value.trim();
  }
}
