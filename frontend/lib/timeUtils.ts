/**
 * Checks if the restaurant is currently open based on the configured timezone and timings.
 * @param openingTime - Format "HH:MM" (e.g., "11:00")
 * @param closingTime - Format "HH:MM" (e.g., "23:00")
 * @param timezone - IANA Timezone string (e.g., "Asia/Kolkata")
 */
export function checkIsRestaurantOpen(
  openingTime: string = "11:00",
  closingTime: string = "23:00",
  timezone: string = "Asia/Kolkata"
): boolean {
  try {
    const now = new Date();
    
    // Get the current time in the target timezone in 24h format (e.g. "23:05")
    const formatter = new Intl.DateTimeFormat("en-IN", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });
    
    const parts = formatter.formatToParts(now);
    const hour = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);
    const minute = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);
    
    const currentTimeMinutes = hour * 60 + minute;
    
    const [openH, openM] = openingTime.split(":").map(Number);
    const [closeH, closeM] = closingTime.split(":").map(Number);
    
    const openTimeMinutes = openH * 60 + openM;
    const closeTimeMinutes = closeH * 60 + closeM;
    
    if (openTimeMinutes <= closeTimeMinutes) {
      // Normal case: open at 11:00, close at 23:00
      return currentTimeMinutes >= openTimeMinutes && currentTimeMinutes < closeTimeMinutes;
    } else {
      // Overnight case: open at 18:00, close at 02:00
      return currentTimeMinutes >= openTimeMinutes || currentTimeMinutes < closeTimeMinutes;
    }
  } catch (error) {
    console.error("Error checking restaurant availability:", error);
    return true; // fail open to prevent blocking checkout accidentally
  }
}

/**
 * Formats 24h time to 12h AM/PM
 * @param time24h - Format "HH:MM"
 */
export function formatTime12h(time24h: string): string {
  try {
    const [h, m] = time24h.split(":");
    const date = new Date();
    date.setHours(parseInt(h, 10), parseInt(m, 10));
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  } catch {
    return time24h;
  }
}
