import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { track } from "../lib/analytics.js";

const pageNames: Record<string, string> = {
  "/": "home",
  "/menu": "menu",
  "/loyalty": "loyalty",
  "/profile": "profile",
  "/events": "events",
  "/stamps": "stamps",
  "/history": "history",
  "/restaurants": "restaurants",
  "/cakes": "cakes",
  "/party": "party",
  "/catering": "catering",
  "/deals": "deals",
  "/onboarding": "onboarding",
};

export function usePageView() {
  const { pathname } = useLocation();

  useEffect(() => {
    const page = pageNames[pathname] || pathname;
    track("page_view", { page });
  }, [pathname]);
}
