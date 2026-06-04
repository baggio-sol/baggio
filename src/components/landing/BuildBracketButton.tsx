'use client';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { OPEN_ONBOARDING_EVENT } from '@/components/onboarding/OnboardingModal';

export default function BuildBracketButton({ children, className, style }: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const router = useRouter();

  const handleClick = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      window.dispatchEvent(new CustomEvent(OPEN_ONBOARDING_EVENT, {
        detail: {
          name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        },
      }));
    } else {
      router.push('/auth');
    }
  };

  return (
    <button onClick={handleClick} className={className} style={style}>
      {children}
    </button>
  );
}
