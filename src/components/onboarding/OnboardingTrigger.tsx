'use client';
import { OPEN_ONBOARDING_EVENT } from './OnboardingModal';

export default function OnboardingTrigger({
  className,
  style,
  children,
}: {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={className}
      style={style}
      onClick={() => window.dispatchEvent(new Event(OPEN_ONBOARDING_EVENT))}
    >
      {children}
    </button>
  );
}
