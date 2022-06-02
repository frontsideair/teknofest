import { useTransition } from "@remix-run/react";
import type { Transition } from "@remix-run/react/transition";

export function useLoading(regex: RegExp) {
  const transition = useTransition();

  function actionRelevant(transition: Transition) {
    return regex.test(transition?.submission?.action ?? "");
  }

  return actionRelevant(transition) && transition.state !== "idle";
}
