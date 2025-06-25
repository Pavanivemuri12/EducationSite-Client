import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const RedirectCleanHash = ({ fallback = null }) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const basePath = location.pathname.split("/")[1]; // e.g. 'sign-in' or 'signup'
    const cleanPath = `/${basePath}`;

    if (location.hash || location.search || location.pathname.includes("*")) {
      navigate(cleanPath, { replace: true });
    }
  }, [location, navigate]);

  return fallback;
};

export default RedirectCleanHash;
