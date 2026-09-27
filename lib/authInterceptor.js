"use client";

import { useEffect, useState } from "react";

export default function AuthInterceptor({ children }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    console.log("🔒 AuthInterceptor: Initializing...");

    // 1. Keep reference to original fetch
    const originalFetch = window.fetch;

    // 2. Override global fetch
    window.fetch = async (...args) => {
      let [resource, config] = args;
      
      // Initialize config if missing
      config = config || {};
      config.headers = config.headers || {};

      // 3. Get Token
      const token = localStorage.getItem("token");

      // 4. Check if we should attach token
      // We attach it if the token exists AND the URL is internal (api)
      // This regex checks for relative paths like "/api", "api", or absolute paths to same origin
      const isInternal = 
        typeof resource === "string" && 
        (resource.startsWith("/") || resource.startsWith("http") || !resource.startsWith("http"));

      if (token && isInternal) {
        // console.log("🔒 Attaching token to:", resource); // Uncomment to debug
        config.headers = {
          ...config.headers,
          "Authorization": `Bearer ${token}`,
        };
      } else if (!token) {
        console.warn("⚠️ No token found in localStorage");
      }

      // 5. Execute request
      try {
        const response = await originalFetch(resource, config);
        
        // Optional: specific handling for 401 (Unauthorized) 
        // if (response.status === 401) { logout(); }
        
        return response;
      } catch (error) {
        console.error("Fetch error:", error);
        throw error;
      }
    };

    // 6. Mark as ready to render app
    setIsReady(true);

    // Cleanup
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  // 🛑 BLOCK RENDERING until fetch is patched
  // This prevents the "Race Condition" where child components fetch before we are ready
  if (!isReady) {
    return (
      <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}