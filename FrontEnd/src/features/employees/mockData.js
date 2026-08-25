// Tasks / leave requests mock datasets
export const tasks = [
  { id: "tsk-1", task: "Collect PRALLI \u2014 Field 4", assignedTo: "Sunita Devi", warehouse: "Manimau Centre", priority: "High", due: "Today (5 Aug)", status: "In Progress", category: "Field", description: "Bale collection and moisture verification from Farmer Batch #409" },
  { id: "tsk-2", task: "Stock audit \u2014 Seed Store", assignedTo: "Manoj Kumar", warehouse: "Manimau Centre", priority: "Medium", due: "Tomorrow (6 Aug)", status: "Not Started", category: "Inventory", description: "Monthly physical stock count of hybrid seeds & fertiliser bags" },
  { id: "tsk-3", task: "Weighment slip review \u2014 Batch 18660-18664", assignedTo: "Rajesh Yadav", warehouse: "Manimau Centre", priority: "Normal", due: "Today (5 Aug)", status: "Completed", category: "Weighment", description: "Verify tare weights and moisture deduction slabs for morning incoming trucks" },
  { id: "tsk-4", task: "Gatekeeper Security & Fire Safety Audit", assignedTo: "Karan Singh", warehouse: "Betiya Hata Store", priority: "High", due: "7 Aug 2026", status: "In Progress", category: "General", description: "Inspect perimeter fences, fire extinguishers, and visitor logs" },
  { id: "tsk-5", task: "Calibrate Weighbridge Scale #2", assignedTo: "Anita Prasad", warehouse: "Sai Complex Yard", priority: "High", due: "Today (5 Aug)", status: "Completed", category: "Weighment", description: "Standard load cell zero-point test and certificate update" },
];

export const leaveRequests = [
  { id: "lr-1", employee: "Anita Prasad", warehouse: "Manimau Centre", type: "Casual Leave", dates: "8 Aug \u2013 10 Aug 2026", days: 3, reason: "Family function in hometown", status: "Pending", appliedOn: "4 Aug 2026" },
  { id: "lr-2", employee: "Rajesh Yadav", warehouse: "Manimau Centre", type: "Sick Leave", dates: "24 Jul \u2013 26 Jul 2026", days: 3, reason: "Viral fever and doctor advice for rest", status: "Approved", appliedOn: "23 Jul 2026" },
  { id: "lr-3", employee: "Manoj Kumar", warehouse: "Betiya Hata Store", type: "Earned Leave", dates: "12 Aug \u2013 15 Aug 2026", days: 4, reason: "Personal annual leave for domestic work", status: "Pending", appliedOn: "5 Aug 2026" },
  { id: "lr-4", employee: "Sunita Devi", warehouse: "Sai Complex Yard", type: "Emergency Leave", dates: "2 Aug 2026", days: 1, reason: "Urgent medical checkup for family member", status: "Approved", appliedOn: "1 Aug 2026" },
  { id: "lr-5", employee: "Karan Singh", warehouse: "Gorakhpur North", type: "Casual Leave", dates: "1 Aug 2026", days: 1, reason: "Personal work at local government office", status: "Rejected", appliedOn: "31 Jul 2026" },
];
