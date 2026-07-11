"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { registerRouter } from "../utils/navigation";

export default function RouterBridge() {
  const router = useRouter();

  useEffect(() => {
    registerRouter(router);
  }, [router]);

  return null;
}
