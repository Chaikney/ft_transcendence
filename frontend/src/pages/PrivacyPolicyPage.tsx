import { useNavigate } from 'react-router-dom';
import { TerminalCard } from '@/components/TerminalCard';

export const PrivacyPolicyPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen p-8 flex justify-center">
      <TerminalCard 
        title="terms_of_service.txt" 
        maxWidth="max-w-3xl"
        onBack={() => navigate(-1)} 
      >
        <div className="text-text-secondary font-mono text-sm leading-relaxed space-y-6">
          <p className="text-text-muted">Last updated: June 2026</p>
          
          <div>
            <h2 className="text-accent font-bold mb-2">1. DATA_COLLECTION</h2>
            <div className="space-y-2">
              <p>We collect the minimum data necessary to operate the platform.</p>
              <p>Authentication data: your 42 Network username, display name, and profile avatar are retrieved via OAuth 2.0 during login.</p>
              <p>Game data: match results, ELO ratings, move history, and timestamps are stored to provide game statistics and leaderboard functionality.</p>
              <p>Session data: a JWT token is stored in your browser's localStorage to maintain your authenticated session.</p>
              <p>We do not collect email addresses, passwords, payment information, or any sensitive personal data beyond what is provided by your 42 OAuth profile.</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-accent font-bold mb-2">2. DATA_USAGE</h2>
            <div className="space-y-2">
              <p>Your data is used exclusively to operate and improve ft_transcendence.</p>
              <p>Authentication data is used to identify you across sessions and display your profile.</p>
              <p>Game data is used to calculate ELO ratings, display match history, and populate leaderboards.</p>
              <p>We do not sell, rent, or share your data with third parties for commercial purposes.</p>
              <p>Aggregated, anonymized statistics may be used to improve platform performance.</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-accent font-bold mb-2">3. DATA_STORAGE</h2>
            <div className="space-y-2">
              <p>All data is stored in a PostgreSQL database hosted on our infrastructure.</p>
              <p>JWT tokens are stored client-side in localStorage and expire after 24 hours.</p>
              <p>Game history is retained indefinitely unless you request deletion.</p>
              <p>All data transmission occurs over HTTPS/WSS encrypted connections.</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-accent font-bold mb-2">4. YOUR_RIGHTS</h2>
            <div className="space-y-2">
              <p>You have the right to access all data we hold about you.</p>
              <p>You have the right to request deletion of your account and all associated data.</p>
              <p>You have the right to export your data in JSON format.</p>
              <p>To exercise any of these rights, contact the project team via your 42 intra profile.</p>
              <p>Account deletion requests are processed within 30 days.</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-accent font-bold mb-2">5. COOKIES_AND_STORAGE</h2>
            <div className="space-y-2">
              <p>We use localStorage (not cookies) to store your authentication token.</p>
              <p>No tracking cookies or third-party analytics scripts are used.</p>
              <p>No advertising networks have access to this platform.</p>
              <p>You can clear your stored data at any time by logging out or clearing browser storage.</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-accent font-bold mb-2">6. THIRD_PARTY_SERVICES</h2>
            <div className="space-y-2">
              <p>42 Network OAuth API is used for authentication. Their privacy policy applies to the authentication handshake.</p>
              <p>Google Fonts (JetBrains Mono, Syne) are loaded for typography. Font requests are made to Google's CDN.</p>
              <p>No other third-party services, trackers, or analytics tools are integrated.</p>
            </div>
          </div>

          <div>
            <h2 className="text-accent font-bold mb-2">7. CONTACT</h2>
            <div className="space-y-2">
              <p>This project was created as part of the 42 curriculum.</p>
              <p>For privacy-related questions or data requests, contact the team via 42 intra.</p>
              <p>Last updated: June 2026. This policy may be updated as the project evolves.</p>
            </div>
          </div>
        </div>
      </TerminalCard>
    </div>
  );
};