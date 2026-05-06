import { ApplicationData } from "../types";

// Mock data based on the CSV provided by the user
const MOCK_DATA: ApplicationData[] = [
  { no: 1, dateIn: "2026-04-01", customerName: "SUNARYO", salesman: "ANNISA ZURAIDA", unit: "DAIHATSU Granmax PU AC PS 1.5 MC", category: "COMMERCIAL", tdp: "30.00%", tenor: 48, status: "CANCELED", remarks: "YBS TIDAK MENGISI LINK SURVEY", approvalDate: "2026-04-17" },
  { no: 2, dateIn: "2026-04-01", customerName: "ARDIANSYAH", salesman: "CHAIRUL ANAM", unit: "DAIHATSU SIGRA 1.0 D MT MC", category: "PASSANGER", tdp: "25.00%", tenor: 60, status: "REJECT", remarks: "REJECT SKEMA MINIM", approvalDate: "2026-04-08" },
  { no: 3, dateIn: "2026-04-02", customerName: "THOMAS ALPA EDISON", salesman: "KHAIRUL ANWAR", unit: "DAIHATSU SIGRA 1.2 R MT MC", category: "PASSANGER", tdp: "28.55%", tenor: 60, status: "CANCELED", remarks: "DO ACC", approvalDate: "2026-04-01" },
  { no: 4, dateIn: "2026-04-02", customerName: "RIANTIMALA", salesman: "INDRA GUNAWANSYAH", unit: "DAIHATSU SIGRA 1.0 M MT MC", category: "PASSANGER", tdp: "25.00%", tenor: 60, status: "REJECT", remarks: "BAD PEFINDO", approvalDate: "2026-04-02" },
  { no: 5, dateIn: "2026-04-02", customerName: "ANDRI ARDANA", salesman: "RIKA WELYANA A MD", unit: "DAIHATSU ROCKY NEW ROCKY 1.2 X CVT", category: "PASSANGER", tdp: "20.49%", tenor: 60, status: "REJECT", remarks: "BAD PEFINDO", approvalDate: "2026-04-03" },
  { no: 11, dateIn: "2026-04-07", customerName: "WINARNO", salesman: "JOKO NUGROHO", unit: "DAIHATSU SIGRA 1.2 R MT MC", category: "PASSANGER", tdp: "51.47%", tenor: 60, status: "APPROVED", remarks: "BELUM ADA INFO DO", approvalDate: "2026-04-08" },
  { no: 15, dateIn: "2026-04-09", customerName: "SAFARUDIN BASRI", salesman: "JOHANSYAH", unit: "DAIHATSU Granmax PU AC PS 1.5 MC", category: "COMMERCIAL", tdp: "30.00%", tenor: 48, status: "APPROVED", remarks: "APPROVE FINAL", approvalDate: "2026-04-11" },
  { no: 16, dateIn: "2026-04-10", customerName: "YUWONO", salesman: "JOHANSYAH", unit: "DAIHATSU Granmax PU AC PS 1.5 MC", category: "COMMERCIAL", tdp: "30.00%", tenor: 48, status: "APPROVED", remarks: "CETAK KONTRAK", approvalDate: "2026-04-15" },
  { no: 17, dateIn: "2026-04-10", customerName: "ABDUL HAMID", salesman: "JOKO NUGROHO", unit: "DAIHATSU Granmax PU 1.3 STD FH E4", category: "COMMERCIAL", tdp: "30.00%", tenor: 48, status: "APPROVED", remarks: "WOP AUTO DEBET", approvalDate: "2026-04-15" },
  { no: 27, dateIn: "2026-04-17", customerName: "MUDASSIR", salesman: "RICKY ARISTA S P", unit: "DAIHATSU Granmax PU AC PS BOX 1.5", category: "COMMERCIAL", tdp: "30.00%", tenor: 48, status: "CREDIT ANALYST", remarks: "BELUM LENGKAP" },
  { no: 29, dateIn: "2026-04-18", customerName: "BILLY DIAN PERKASA", salesman: "RICKY ARISTA S P", unit: "DAIHATSU Granmax BV 1.3 AC FH", category: "COMMERCIAL", tdp: "30.00%", tenor: 48, status: "APPROVED", remarks: "APPROVE FINAL TDP 39%", approvalDate: "2026-04-21" },
  { no: 43, dateIn: "2026-04-30", customerName: "MAT SALEH", salesman: "CHAIRUL ANAM", unit: "DAIHATSU Granmax PU 1.3 STD FH E4", category: "COMMERCIAL", tdp: "30.00%", tenor: 48, status: "SURVEYING", remarks: "BELUM ISI LINK" },
  { no: 1, dateIn: "2026-05-02", customerName: "NURIYANTO", salesman: "ERIK EVANA", unit: "DAIHATSU SIGRA 1.0 M MT MC", category: "PASSANGER", tdp: "25.00%", tenor: 60, status: "CREDIT ANALYST", remarks: "" },
  { no: 2, dateIn: "2026-05-05", customerName: "DEO ALFAZERI", salesman: "CHAIRUL ANAM", unit: "DAIHATSU SIGRA 1.0 D MT MC", category: "PASSANGER", tdp: "20.37%", tenor: 60, status: "REJECT", remarks: "SKEMA MINIM", approvalDate: "2026-05-06" },
];

export async function fetchApplications(): Promise<ApplicationData[]> {
  const gasUrl = import.meta.env.VITE_GAS_URL;
  
  if (!gasUrl) {
    console.warn("VITE_GAS_URL not found, using mock data");
    return MOCK_DATA;
  }

  try {
    const response = await fetch(gasUrl);
    if (!response.ok) throw new Error("Failed to fetch from Google Sheets");
    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return MOCK_DATA;
  }
}
