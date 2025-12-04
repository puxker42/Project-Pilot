// src/utils/api.js
import { toast } from 'react-toastify';

export const authorizedRequest = async (url, method = 'GET', body = null) => {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  try {
    const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/${url}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });

    let data;
    try {
      data = await res.json();
    } catch (err) {
      console.error("Failed to parse JSON response:", err);
      data = { message: "Invalid response from server" };
    }

    if (!res.ok) {
      const errorMessage = data.message || data.error || 'Something went wrong';
      // Prevent duplicate toasts or spamming? For now, just show it.
      toast.error(errorMessage);
    }

    return { status: res.status, data };
  } catch (error) {
    console.error("API Request Error:", error);
    toast.error("Network error. Please check your connection.");
    return { status: 500, data: { success: false, message: "Network Error" } };
  }
};
