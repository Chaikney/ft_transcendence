import { TerminalCard } from '@/components/TerminalCard';

export const TermsOfServicePage = () => {
  return (
    <div className="min-h-screen p-8 flex justify-center pt-20">
      <TerminalCard title="terms_of_service.txt" maxWidth="max-w-3xl">
        <div className="text-text-secondary font-mono text-sm leading-relaxed space-y-6">
          <p className="text-text-muted">Last updated: June 2026</p>
          
          <p>By accessing ft_transcendence, you acknowledge that you are using an experimental platform developed by students at 42.</p>
          
          <h3 className="text-accent font-bold">1. Code of Conduct</h3>
          <p>This is a fair-play environment. Users caught exploiting bugs, botting, or attempting to compromise the backend infrastructure will have their accounts terminated without warning.</p>
          
          <h3 className="text-accent font-bold">2. Service Availability</h3>
          <p>This is an educational project. The service is provided "as is". We reserve the right to modify, suspend, or discontinue the service at any time for maintenance, grading, or development reasons.</p>
          
          <h3 className="text-accent font-bold">3. Intellectual Property</h3>
          <p>All game logic and visual components are created for the scope of the 42 curriculum. Redistribution or commercial use of this codebase is prohibited.</p>
        </div>
      </TerminalCard>
    </div>
  );
};