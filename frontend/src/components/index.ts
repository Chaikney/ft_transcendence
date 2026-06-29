// 1. Button — primary/secondary/ghost/danger variants + loading state
export { Button } from './Button';

// 2. ErrorMessage — error state with retry action
export { ErrorMessage } from './ErrorMessage';

// 3. LoadingScreen — page loader, inline loader, board skeleton, skeleton block
export { PageLoader, InlineLoader, BoardSkeleton, Skeleton } from './LoadingScreen';

// 4. ConnectionStatus — WebSocket status indicator with animated pulse dot
export { ConnectionStatus } from './ConnectionStatus';

// 5. Navbar — fixed top navigation with game tabs and user badge
export { Navbar } from './Navbar';

// 6. TerminalCard — styled card with bracket corners, terminal header, glow
export { TerminalCard } from './TerminalCard';

// 7. Badge (Insignia) — status/tag pill: success/warning/error/info/accent/muted/online/offline
export { Badge } from './Badge';

// 8. TerminalInput — monospace input with label, prefix, error, hint states
export { TerminalInput } from './TerminalInput';

// 9. Modal — portal-based overlay with terminal header, actions, Escape-to-close
export { Modal } from './Modal';

// 10. Avatar — user avatar with initials fallback, ELO badge, online status dot
export { Avatar } from './Avatar';

// ── Protected route (utility, not design system) ───────────────────────────
export { ProtectedRoute } from './ProtectedRoute';