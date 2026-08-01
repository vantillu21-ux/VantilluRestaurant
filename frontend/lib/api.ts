export const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://vantillurestaurant.onrender.com";

if (process.env.NODE_ENV !== "production") {
  console.log("API:", API_URL);
}
