export const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://vantillurestaurant.onrender.com";

if (process.env.NODE_ENV !== "production") {
  console.log("API:", API_URL);
}

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('vantillu_admin_token') : null;
  
  const headers = new Headers(options.headers || {});
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  const config = {
    ...options,
    headers,
  };
  
  try {
    const response = await fetch(url, config);
    if (response.status === 401 || response.status === 403) {
      if (typeof window !== 'undefined' && window.location.pathname.includes('/admin')) {
        localStorage.removeItem('vantillu_admin_token');
        localStorage.removeItem('vantillu_admin_role');
        localStorage.removeItem('vantillu_admin_permissions');
        window.location.href = '/admin'; // Force redirect to login
      }
    }
    return response;
  } catch (error) {
    throw error;
  }
};
