// src/components/RedirectCleanHash.jsx
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const RedirectCleanHash = ({ fallback = null }) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const basePath = location.pathname.split("/")[1]; // 'sign-in' or 'sign-up'
    const cleanPath = `/${basePath}`;

    if (location.hash || location.search) {
      navigate(cleanPath, { replace: true });
    }
  }, [location, navigate]);

  return fallback;
};

export default RedirectCleanHash;
