import { useNavigate } from 'react-router-dom';
import { TerminalCard } from '@/components/TerminalCard';

export const TermsOfServicePage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen p-8 flex justify-center pt-20">
      <TerminalCard
        title="terms_of_service.txt"
        maxWidth="max-w-3xl"
        onBack={() => navigate(-1)} >
        <div className="text-text-secondary font-mono text-sm leading-relaxed space-y-6">
          <p className="text-text-muted">Last updated: July 2026</p>

          <p>By accessing ft_transcendence, you acknowledge that you are using an experimental platform developed by students at 42. It is a game platform, for entertainment and education purposes only.</p>
          <p>This document is an attempt to express in serious sounding language, what could be summarised in the wisdom of the immortal Bill & Ted: BE EXCELLENT TO ONE ANOTHER.</p>

          <h3 className="text-accent font-bold">1. ACCEPTANCE_OF_TERMS</h3>
          <p>By accessing or using ft_transcendence, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not access or use the platform. These terms apply to all users, including registered accounts and guests. We reserve the right to update these terms at any time. Continued use constitutes acceptance of updated terms.</p>

          <h3 className="text-accent font-bold">2. ELIGIBILITY_AND_ACCOUNTS</h3>
          <p>You must have a valid 42 Network account to register and use this platform. You are responsible for maintaining the security of your account credentials. You may not share your account or allow others to access the platform using your credentials. One account per person. Multiple accounts for the same individual are not permitted. You must be at least 13 years of age to use this platform.</p>

          <h3 className="text-accent font-bold">3. ACCEPTABLE_USE</h3>
          <p>You agree to use the platform only for lawful purposes and in accordance with these terms. You may not attempt to gain unauthorized access to any part of the platform or its infrastructure. You may not use automated tools, bots, or scripts to interact with the platform without explicit permission. You may not attempt to cheat, exploit bugs, or manipulate game outcomes. You may not harass, threaten, or abuse other users through any platform feature. Violations may result in immediate account suspension or permanent ban.</p>
          <h3 className="text-accent font-bold">4. GAME_RULES</h3>
          <p>All games must be played in good faith. Intentional disconnection to avoid a loss is prohibited. ELO ratings reflect competitive performance and will be adjusted accordingly.
            Match results are final once recorded. Disputes must be raised within 24 hours. Exploiting game bugs or using external assistance during competitive matches is prohibited.</p>

           <h3 className="text-accent font-bold">5. INTELLECTUAL_PROPERTY</h3>
          <p>The platform source code, design system, and assets are created as part of the 42 curriculum. You retain ownership of any content you create on the platform (profile information, etc.). By using the platform, you grant us a non-exclusive license to display your profile information. You may not reproduce, distribute, or create derivative works from platform assets without permission.</p>

           <h3 className="text-accent font-bold">6. DISCLAIMERS_AND_LIMITATIONS</h3>
          <p>This platform is provided "as is" as part of a 42 curriculum project. We do not guarantee continuous availability, accuracy, or suitability for any particular purpose. We are not liable for any damages resulting from use or inability to use the platform. Game statistics and ELO ratings are for entertainment purposes within the 42 community.</p>

           <h3 className="text-accent font-bold">7. TERMINATION</h3>
          <p>We reserve the right to suspend or terminate your access at any time for violations of these terms. You may request account deletion at any time by contacting the project team.
              Upon termination, your game history may be retained in anonymized form for statistical purposes. Sections regarding intellectual property and disclaimers survive termination.</p>

           <h3 className="text-accent font-bold">8. CONTACT</h3>
          <p>For questions regarding these terms, contact the project team via 42 intra. These terms are governed by the policies of the 42 School institution.</p>
        </div>
      </TerminalCard>
    </div>
  );
};
