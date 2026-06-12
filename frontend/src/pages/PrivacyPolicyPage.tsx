import { TerminalCard } from '@/components/TerminalCard';

export const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen p-8 flex justify-center">
      <TerminalCard title="privacy_policy.txt" maxWidth="max-w-3xl">
        <div className="text-text-secondary font-mono text-sm leading-relaxed space-y-4">
          <p className="text-text-muted">Last updated: June 2026</p>
          
          <h2 className="text-accent font-bold mt-4">1. DATA_COLLECTION</h2>
          <p>'We collect the minimum data necessary to operate the platform.',
            'Authentication data: your 42 Network username, display name, and profile avatar are retrieved via OAuth 2.0 during login.',
            'Game data: match results, ELO ratings, move history, and timestamps are stored to provide game statistics and leaderboard functionality.',
            'Session data: a JWT token is stored in your browser\'s localStorage to maintain your authenticated session.',
            'We do not collect email addresses, passwords, payment information, or any sensitive personal data beyond what is provided by your 42 OAuth profile.',</p>
          
          <h2 className="text-accent font-bold mt-4">2. DATA_USAGE</h2>
          <p>'Your data is used exclusively to operate and improve ft_transcendence.',
            'Authentication data is used to identify you across sessions and display your profile.',
            'Game data is used to calculate ELO ratings, display match history, and populate leaderboards.',
            'We do not sell, rent, or share your data with third parties for commercial purposes.',
            'Aggregated, anonymized statistics may be used to improve platform performance.',</p>
          
          <h2 className="text-accent font-bold mt-4">3. DATA_STORAGE</h2>
          <p>'All data is stored in a PostgreSQL database hosted on our infrastructure.',
              'JWT tokens are stored client-side in localStorage and expire after 24 hours.',
              'Game history is retained indefinitely unless you request deletion.',
              'All data transmission occurs over HTTPS/WSS encrypted connections.',</p>
          
          <h2 className="text-accent font-bold mt-4">4. YOUR_RIGHTS</h2>
          <p>'You have the right to access all data we hold about you.',
              'You have the right to request deletion of your account and all associated data.',
              'You have the right to export your data in JSON format.',
              'To exercise any of these rights, contact the project team via your 42 intra profile.',
              'Account deletion requests are processed within 30 days.',</p>
          
          <h2 className="text-accent font-bold mt-4">5. COOKIES_AND_STORAGE</h2>
          <p>'We use localStorage (not cookies) to store your authentication token.',
              'No tracking cookies or third-party analytics scripts are used.',
              'No advertising networks have access to this platform.',
              'You can clear your stored data at any time by logging out or clearing browser storage.',</p>
          
          <h2 className="text-accent font-bold mt-4">6. THIRD_PARTY_SERVICES</h2>
          <p>'42 Network OAuth API is used for authentication. Their privacy policy applies to the authentication handshake.',
              'Google Fonts (JetBrains Mono, Syne) are loaded for typography. Font requests are made to Google\'s CDN.',
              'No other third-party services, trackers, or analytics tools are integrated.',</p>

          <h2 className="text-accent font-bold mt-4">7. CONTACT</h2>
          <p>'This project was created as part of the 42 curriculum.',
              'For privacy-related questions or data requests, contact the team via 42 intra.',
              'Last updated: 2024. This policy may be updated as the project evolves.',</p>
        </div>
      </TerminalCard>
    </div>
  );
};
