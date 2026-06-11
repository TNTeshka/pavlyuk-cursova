import { useEffect } from "react";
import { initSocket } from "../socket";

export function useSocket() {
  useEffect(function () {
    const cleanup = initSocket();
    return cleanup;
  }, []);
}
