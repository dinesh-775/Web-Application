import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});

export function authConfig() {
  const t = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${t}`
    }
  };
}

export async function downloadReceipt(receiptId, receiptNumber) {
  try {
    const response = await api.get(`/receipts/${receiptId}/download`, {
      ...authConfig(),
      responseType: "blob"
    });
    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${receiptNumber || "receipt"}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Receipt download failed", error);
    throw new Error("Failed to download receipt PDF file.");
  }
}