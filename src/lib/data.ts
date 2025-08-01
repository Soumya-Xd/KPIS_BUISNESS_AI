// Project data interface and utilities
export interface ProjectData {
  projectId: number;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  websiteName: string;
  projectPrice: number;
  negotiated: boolean;
  deliveredOnTime: boolean;
  deliveryDate: string;
  deliveryStatus: 'On Time' | 'Delayed' | 'In Progress';
  techStack: string;
  developersNeeded: number;
  assignedDevelopers: string;
  developmentTeamName: string;
}

// Google Sheets CSV export URL for real-time data
const GOOGLE_SHEETS_CSV_URL = 'https://docs.google.com/spreadsheets/d/1iV8cC7yr1ttK6x4xdk0QjUdP-N48RyFjQbYnATirJR8/export?format=csv';

// Cache for the fetched data to avoid repeated requests
let cachedData: ProjectData[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 30000; // 30 seconds cache

function parsePrice(priceStr: string): number {
  // Handle both formats: with and without ₹ symbol
  return parseInt(priceStr.replace(/[₹,]/g, ''));
}

async function fetchGoogleSheetsData(): Promise<string> {
  try {
    const response = await fetch(GOOGLE_SHEETS_CSV_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error);
    throw error;
  }
}

function parseDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split('-');
  const monthMap: { [key: string]: number } = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
  };
  return new Date(parseInt(year), monthMap[month], parseInt(day));
}

function parseCSVLine(line: string): string[] {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip the next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

export async function parseProjectData(): Promise<ProjectData[]> {
  // Check cache first
  const now = Date.now();
  if (cachedData && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedData;
  }

  try {
    const csvData = await fetchGoogleSheetsData();
    const lines = csvData.trim().split('\n');
    
    const data = lines.slice(1).map(line => {
      const values = parseCSVLine(line);
      
      return {
        projectId: parseInt(values[0]) || 0,
        customerName: values[1] || '',
        customerAddress: values[2] || '',
        customerPhone: values[3] || '',
        websiteName: values[4] || '',
        projectPrice: parsePrice(values[5] || '0'),
        negotiated: values[6] === 'Yes',
        deliveredOnTime: values[7] === 'Yes',
        deliveryDate: values[8] || '',
        deliveryStatus: (values[9] as 'On Time' | 'Delayed' | 'In Progress') || 'In Progress',
        techStack: values[10] || '',
        developersNeeded: parseInt(values[11]) || 0,
        assignedDevelopers: values[12]?.replace(/"/g, '') || '',
        developmentTeamName: values[13] || ''
      };
    }).filter(project => project.projectId > 0); // Filter out invalid entries

    // Update cache
    cachedData = data;
    lastFetchTime = now;
    
    return data;
  } catch (error) {
    console.error('Error parsing project data:', error);
    // Return empty array if fetch fails
    return [];
  }
}

// Function to manually refresh cache
export function refreshProjectData(): void {
  cachedData = null;
  lastFetchTime = 0;
}

export function calculateKPIs(data: ProjectData[]) {
  const totalProjects = data.length;
  const completedProjects = data.filter(p => p.deliveryStatus !== 'In Progress').length;
  const onTimeProjects = data.filter(p => p.deliveredOnTime).length;
  const totalPrice = data.reduce((sum, p) => sum + p.projectPrice, 0);
  const uniqueTeams = new Set(data.map(p => p.developmentTeamName)).size;
  const onTimeRate = (onTimeProjects / totalProjects) * 100;

  return {
    totalProjects,
    completedProjects,
    totalPrice,
    uniqueTeams,
    onTimeRate
  };
}

export function getProjectsByTeam(data: ProjectData[]) {
  const teamCounts: { [key: string]: number } = {};
  data.forEach(project => {
    teamCounts[project.developmentTeamName] = (teamCounts[project.developmentTeamName] || 0) + 1;
  });
  return Object.entries(teamCounts).map(([name, count]) => ({ name, count }));
}

export function getDeliveryStatusDistribution(data: ProjectData[]) {
  const statusCounts: { [key: string]: number } = {};
  data.forEach(project => {
    statusCounts[project.deliveryStatus] = (statusCounts[project.deliveryStatus] || 0) + 1;
  });
  return Object.entries(statusCounts).map(([status, count]) => ({ status, count }));
}

export function getTechStackDistribution(data: ProjectData[]) {
  const techCounts: { [key: string]: number } = {};
  data.forEach(project => {
    techCounts[project.techStack] = (techCounts[project.techStack] || 0) + 1;
  });
  return Object.entries(techCounts).map(([tech, count]) => ({ tech, count }));
}

export function getMonthlyTrends(data: ProjectData[]) {
  const monthlyData: { [key: string]: { deliveries: number; totalValue: number; projects: number } } = {};
  
  data.forEach(project => {
    if (project.deliveryStatus !== 'In Progress') {
      const date = parseDate(project.deliveryDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { deliveries: 0, totalValue: 0, projects: 0 };
      }
      
      monthlyData[monthKey].deliveries += 1;
      monthlyData[monthKey].totalValue += project.projectPrice;
      monthlyData[monthKey].projects += 1;
    }
  });

  return Object.entries(monthlyData)
    .map(([month, data]) => ({
      month,
      deliveries: data.deliveries,
      averageValue: Math.round(data.totalValue / data.projects),
      totalValue: data.totalValue
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}