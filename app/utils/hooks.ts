import { useTransition } from "@remix-run/react";
import type { Transition } from "@remix-run/react/transition";

type Predicate = (_: Transition) => boolean;

export function useLoading(predicate: Predicate = () => true) {
  const transition = useTransition();

  return predicate(transition) && transition.state === "submitting";
}
