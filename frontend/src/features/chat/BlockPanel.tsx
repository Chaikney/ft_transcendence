import { useState, useEffect, useCallback } from 'react';
import { get, post, del } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { TerminalInput } from '@/components/TerminalInput';

// ── Types ──────────────────────────────────────────────────────────────────
interface BlockedUser {
  id:         number;
  username:   string;
  elo:        number;
  blocked_at: string;
}

interface UserSearchResult {
  id:       number;
  username: string;
  elo:      number;
}

// ── Mock data ──────────────────────────────────────────────────────────────
const MOCK_BLOCKED: BlockedUser[] = [
  { id: 10, username: 'toxic_user',  elo: 800,  blocked_at: '2024-01-10T10:00:00Z' },
  { id: 11, username: 'spammer_42',  elo: 500,  blocked_at: '2024-01-12T14:30:00Z' },
];

const MOCK_SEARCH: UserSearchResult[] = [
  { id: 10, username: 'toxic_user',  elo: 800  },
  { id: 11, username: 'spammer_42',  elo: 500  },
  { id: 12, username: 'another_usr', elo: 1100 },
];

// ── Helpers ────────────────────────────────────────────────────────────────
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', {
    year:  'numeric',
    month: 'short',
    day:   'numeric',
  });

// ── Styles ────────────────────────────────────────────────────────────────
const s = {
  wrapper:
    'flex flex-col gap-0',

  // Tabs
  tabRow:
    'flex border-b border-border-strong',
  tab:
    'flex-1 px-3 py-2 font-mono text-[10px] tracking-widest uppercase ' +
    'cursor-pointer transition-colors border-b-2 border-transparent',
  tabActive:
    'text-accent border-b-accent bg-accent-bg',
  tabInactive:
    'text-text-muted hover:text-text-secondary',

  // Section header
  sectionHeader:
    'flex items-center justify-between px-4 py-2 border-b border-border',
  sectionTitle:
    'text-[10px] font-mono tracking-widest uppercase text-text-muted',
  sectionCount:
    'text-[10px] font-mono text-status-error',

  // Search bar
  searchRow:
    'px-4 py-3 border-b border-border',

  // Blocked user row
  userRow:
    'flex items-center gap-3 px-4 py-2.5 ' +
    'border-b border-border transition-colors hover:bg-bg-elevated group',
  userInfo:
    'flex flex-col gap-0.5 flex-1 min-w-0',
  userName:
    'text-xs font-mono text-text-primary truncate',
  userMeta:
    'text-[10px] font-mono text-text-muted',
  userActions:
    'flex items-center gap-2 flex-shrink-0',

  // Search result row
  searchRow2:
    'flex items-center gap-3 px-4 py-2.5 ' +
    'border-b border-border transition-colors hover:bg-bg-elevated',

  // Empty
  empty:
    'flex flex-col items-center justify-center gap-2 py-8 px-4 text-center',
  emptyText:
    'text-[10px] font-mono text-text-muted',
  emptyCursor:
    'text-accent text-[10px] font-mono animate-blink',

  // Error / status
  errorMsg:
    'mx-4 mt-2 px-3 py-2 text-[10px] font-mono ' +
    'border border-status-error/30 bg-status-error-bg text-status-error',
  successMsg:
    'mx-4 mt-2 px-3 py-2 text-[10px] font-mono ' +
    'border border-status-success/30 bg-status-success-bg text-status-success',

  // Loading
  loadingRow:
    'flex items-center justify-center py-6',
  spinner:
    'w-5 h-5 rounded-full border-2 border-border-strong border-t-accent animate-spin-slow',
} as const;

// ── Component ──────────────────────────────────────────────────────────────
export const BlockPanel = () => {
  const currentUser = useAuthStore((s) => s.user);
  const isMock      = import.meta.env.VITE_USE_MOCK === 'true';

  const [tab,           setTab]           = useState<'blocked' | 'search'>('blocked');
  const [blockedUsers,  setBlockedUsers]  = useState<BlockedUser[]>([]);
  const [searchQuery,   setSearchQuery]   = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [loading,       setLoading]       = useState(false);
  const [searching,     setSearching]     = useState(false);
  const [status,        setStatus]        = useState<{
    type: 'error' | 'success';
    msg:  string;
  } | null>(null);

  // ── Load blocked list ─────────────────────────────────────────────────
  const loadBlocked = useCallback(async () => {
    setLoading(true);
    try {
      if (isMock) {
        await new Promise((r) => setTimeout(r, 300));
        setBlockedUsers(MOCK_BLOCKED);
      } else {
        const res = await get<BlockedUser[]>('/blocks');
        setBlockedUsers(res.data);
      }
    } catch {
      setStatus({ type: 'error', msg: 'Failed to load blocked users.' });
    } finally {
      setLoading(false);
    }
  }, [isMock]);

  useEffect(() => {
    loadBlocked();
  }, [loadBlocked]);

  // ── Search users ──────────────────────────────────────────────────────
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      if (isMock) {
        await new Promise((r) => setTimeout(r, 200));
        setSearchResults(
          MOCK_SEARCH.filter((u) =>
            u.username.toLowerCase().includes(query.toLowerCase()) &&
            u.id !== currentUser?.id
          )
        );
      } else {
        const res = await get<UserSearchResult[]>('/users', { query });
        setSearchResults(res.data.filter((u) => u.id !== currentUser?.id));
      }
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, [isMock, currentUser?.id]);

  // ── Block user ────────────────────────────────────────────────────────
  const handleBlock = async (userId: number, username: string) => {
    setStatus(null);
    try {
      if (isMock) {
        const already = blockedUsers.find((b) => b.id === userId);
        if (already) {
          setStatus({ type: 'error', msg: `${username} is already blocked.` });
          return;
        }
        setBlockedUsers((prev) => [
          ...prev,
          { id: userId, username, elo: 0, blocked_at: new Date().toISOString() },
        ]);
        setStatus({ type: 'success', msg: `${username} has been blocked.` });
        return;
      }
      await post('/blocks', { blocked_id: userId });
      setStatus({ type: 'success', msg: `${username} has been blocked.` });
      await loadBlocked();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ?? `Failed to block ${username}.`;
      setStatus({ type: 'error', msg });
    }
  };

  // ── Unblock user ──────────────────────────────────────────────────────
  const handleUnblock = async (userId: number, username: string) => {
    setStatus(null);
    try {
      if (isMock) {
        setBlockedUsers((prev) => prev.filter((b) => b.id !== userId));
        setStatus({ type: 'success', msg: `${username} has been unblocked.` });
        return;
      }
      await del(`/blocks/${userId}`);
      setStatus({ type: 'success', msg: `${username} has been unblocked.` });
      await loadBlocked();
    } catch {
      setStatus({ type: 'error', msg: `Failed to unblock ${username}.` });
    }
  };

  const isBlocked = (userId: number) =>
    blockedUsers.some((b) => b.id === userId);

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className={s.wrapper}>

      {/* Tabs */}
      <div className={s.tabRow}>
        <button
          className={[s.tab, tab === 'blocked' ? s.tabActive : s.tabInactive].join(' ')}
          onClick={() => { setTab('blocked'); setStatus(null); }}
        >
          blocked ({blockedUsers.length})
        </button>
        <button
          className={[s.tab, tab === 'search' ? s.tabActive : s.tabInactive].join(' ')}
          onClick={() => { setTab('search'); setStatus(null); }}
        >
          block user
        </button>
      </div>

      {/* Status message */}
      {status && (
        <div
          className={
            status.type === 'error' ? s.errorMsg : s.successMsg
          }
        >
          // {status.msg}
        </div>
      )}

      {/* ── Blocked list tab ── */}
      {tab === 'blocked' && (
        <>
          <div className={s.sectionHeader}>
            <span className={s.sectionTitle}>&gt; blocked_users</span>
            <span className={s.sectionCount}>
              {blockedUsers.length} blocked
            </span>
          </div>

          {loading ? (
            <div className={s.loadingRow}>
              <span className={s.spinner} />
            </div>
          ) : blockedUsers.length === 0 ? (
            <div className={s.empty}>
              <span className={s.emptyText}>// no blocked users</span>
              <span className={s.emptyCursor}>_</span>
            </div>
          ) : (
            blockedUsers.map((user) => (
              <div key={user.id} className={s.userRow}>
                <Avatar username={user.username} size="sm" />
                <div className={s.userInfo}>
                  <span className={s.userName}>{user.username}</span>
                  <span className={s.userMeta}>
                    blocked {fmtDate(user.blocked_at)}
                  </span>
                </div>
                <div className={s.userActions}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUnblock(user.id, user.username)}
                  >
                    unblock
                  </Button>
                </div>
              </div>
            ))
          )}
        </>
      )}

      {/* ── Search + block tab ── */}
      {tab === 'search' && (
        <>
          <div className={s.searchRow}>
            <TerminalInput
              placeholder="search username..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              prefix=">"
              aria-label="Search users to block"
            />
          </div>

          <div className={s.sectionHeader}>
            <span className={s.sectionTitle}>&gt; search_results</span>
            {searching && (
              <span className={s.spinner} style={{ width: 14, height: 14 }} />
            )}
          </div>

          {searchResults.length === 0 && !searching && (
            <div className={s.empty}>
              <span className={s.emptyText}>
                {searchQuery.trim()
                  ? '// no users found'
                  : '// type a username to search'}
              </span>
              <span className={s.emptyCursor}>_</span>
            </div>
          )}

          {searchResults.map((user) => {
            const blocked = isBlocked(user.id);
            return (
              <div key={user.id} className={s.searchRow2}>
                <Avatar username={user.username} size="sm" />
                <div className={s.userInfo}>
                  <span className={s.userName}>{user.username}</span>
                  <span className={s.userMeta}>{user.elo} ELO</span>
                </div>
                <div className={s.userActions}>
                  {blocked ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUnblock(user.id, user.username)}
                    >
                      unblock
                    </Button>
                  ) : (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleBlock(user.id, user.username)}
                    >
                      block
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </>
      )}

    </div>
  );
};