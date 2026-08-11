export const attendanceStats = [
  { label: "Present Today", value: "94.2%", trend: "+1.4% vs yesterday" },
  { label: "Late Check-ins", value: "6", trend: "across 3 warehouses" },
  { label: "Pending Exceptions", value: "4", trend: "awaiting admin review" },
  { label: "Absent", value: "3", trend: "no check-in recorded" },
];

export const attendanceRecords = [
  { employee: "Manoj Kumar", warehouse: "Manimau Centre", checkIn: "08:02 AM", checkOut: "05:10 PM", status: "Present" },
  { employee: "Sunita Devi", warehouse: "Betiya Hata Store", checkIn: "08:41 AM", checkOut: "\u2014", status: "Late" },
  { employee: "Rajesh Yadav", warehouse: "Sai Complex Yard", checkIn: "\u2014", checkOut: "\u2014", status: "Pending" },
  { employee: "Anita Prasad", warehouse: "Gorakhpur North", checkIn: "\u2014", checkOut: "\u2014", status: "Absent" },
];

// Coarse last-known location, not live GPS tracking - geo-tagged at
// check-in/check-out only, matching how the mobile attendance app works.
export const employeeLocations = [
  { employee: "Manoj Kumar", warehouse: "Manimau Centre", lastSeen: "Today, 08:02 AM", accuracy: "GPS verified at check-in" },
  { employee: "Sunita Devi", warehouse: "Betiya Hata Store", lastSeen: "Today, 08:41 AM", accuracy: "GPS verified at check-in" },
  { employee: "Rajesh Yadav", warehouse: "Sai Complex Yard", lastSeen: "Yesterday, 05:20 PM", accuracy: "Last known - no check-in today" },
  { employee: "Anita Prasad", warehouse: "Gorakhpur North", lastSeen: "2 days ago, 04:55 PM", accuracy: "Last known - no check-in today" },
];
