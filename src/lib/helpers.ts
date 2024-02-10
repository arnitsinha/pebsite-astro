export function getCurrentTimeInItaly(): Date {
  // Create a date object with the current UTC time
  const now = new Date();

  // Convert the UTC time to Eastern Standard Time (UTC-5)
  const offsetEST = -5;
  now.setHours(now.getUTCHours() + offsetEST);

  return now;
}

export function formatTimeForItaly(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true, // This will format the time in 12-hour format with AM/PM
    timeZone: "America/New_York", // Set to Eastern Time Zone
  };

  let formattedTime = new Intl.DateTimeFormat("en-US", options).format(date);

  // Append the time zone abbreviation. 
  // For simplicity, here I'm just appending "EST".
  formattedTime += " EST";

  return formattedTime;
}
