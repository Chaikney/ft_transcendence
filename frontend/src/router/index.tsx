import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/layouts/RootLayout';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { CallbackPage } from '@/pages/CallbackPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ChessGamePage } from '@/features/chess/ChessGamePage';
import { SudokuGamePage } from '@/features/sudoku/SudokuGamePage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PrivacyPolicyPage } from '@/pages/PrivacyPolicyPage';
import { TermsOfServicePage } from '@/pages/TermsOfServicePage';


export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'callback',
        element: <CallbackPage />,
      },
      {
        // :id comes from URL — e.g. /game/chess/chess-001
        path: 'game/chess/:id',
        element: (
          <ProtectedRoute>
            <ChessGamePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'game/sudoku/:id',
        element: (
          <ProtectedRoute>
            <SudokuGamePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile/:username',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
      {
        path: 'privacy',
        element: <PrivacyPolicyPage />,
      },
      {
        path: 'terms',
        element: <TermsOfServicePage />,
      },
    ],
  },
]);
