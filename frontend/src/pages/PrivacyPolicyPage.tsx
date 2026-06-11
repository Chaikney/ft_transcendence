import { TerminalCard } from '@/components/TerminalCard';

export const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen p-8 flex justify-center">
      <TerminalCard title="privacy_policy.txt" maxWidth="max-w-3xl">
        <div className="text-text-secondary font-mono text-sm leading-relaxed space-y-4">
          <p className="text-text-muted">Last updated: June 2026</p>
          
          <p>This service is part of the "ft_transcendence" project at 42. We believe in minimal data footprint and absolute transparency.</p>
          
          <h2 className="text-accent font-bold mt-4">1. Information We Collect</h2>
          <p>We collect only the essential data provided via 42 OAuth: your username, profile image URL, and email. This is strictly to identify you within our system.</p>
          
          <h2 className="text-accent font-bold mt-4">2. Data Usage</h2>
          <p>Your data is used solely for maintaining your game profile, match history, and Elo ranking. We do not sell, trade, or distribute your information.</p>
          
          <h2 className="text-accent font-bold mt-4">3. Data Retention</h2>
          <p>Your data persists as long as your account is active. You may request account deletion at any time, which wipes your associated match history and statistics.</p>
          
          <h2 className="text-accent font-bold mt-4">4. Security</h2>
          <p>While this is an educational project, we follow standard security practices to protect your session. Please ensure your 42 credentials remain secure.</p>
        </div>
      </TerminalCard>
    </div>
  );
};