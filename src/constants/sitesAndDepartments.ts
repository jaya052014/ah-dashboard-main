// Canonical list of Sites - single source of truth
export const SITES = [
  "Arkansas Petcare",
  "Aurora Petcare",
  "Burridge Wrigley",
  "Chattanooga Wrigley",
  "Cleveland Wrigley",
  "Columbus Petcare",
  "Elizabethtown Wrigley",
  "Fremont Royal Canin",
  "Gainesville Wrigley",
  "Greenville Food",
  "Hackettstown Wrigley",
  "Kansas Petcare",
  "Leipsic Petcare",
  "Mattoon Petcare",
  "Sioux City Royal Canin",
  "Topeka Wrigley",
  "Yorkville Wrigley",
] as const;

// Canonical list of Departments - single source of truth
export const DEPARTMENTS = [
  "General",
  "Gum / Mints",
  "Skittles / HIS",
  "Utilities / Facilities",
  "Candy",
  "Snacks",
  "Beverages",
  "Frozen",
  "Dairy",
  "Grocery",
] as const;

// Helper to get sites as options for dropdowns (with "all" option)
export const getSiteOptions = () => {
  return [
    { value: "all", label: "(All)" },
    ...SITES.map(site => ({ value: site, label: site })),
  ];
};

// Helper to get departments as options for dropdowns (with "all" option)
export const getDepartmentOptions = () => {
  return [
    { value: "all", label: "(All)" },
    ...DEPARTMENTS.map(dept => ({ value: dept, label: dept })),
  ];
};


