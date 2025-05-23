import apiClient from "../utils/apiClient";

export async function getCode(address) {
  try {
    const response = await apiClient.post("", {
      method: "eth_getCode",
      params: [address, "latest"],
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching contract code:", error.message);
    throw error;
  }
}
