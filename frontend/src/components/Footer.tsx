import { Link } from 'react-router-dom';

const styles = {
  footer:
    'w-full py-6 flex justify-center gap-6 border-t border-border-strong ' +
    'bg-bg-base z-10 relative mt-auto',
  link:
    'text-xs font-mono text-text-muted hover:text-accent ' +
    'transition-all duration-base cursor-pointer',
} as const;

export const Footer = () => (
  <footer className={styles.footer}>
    <Link to="/privacy" className={styles.link}>
      PRIVACY POLICY
    </Link>
    <Link to="/terms" className={styles.link}>
      TERMS OF SERVICE
    </Link>
  </footer>
);