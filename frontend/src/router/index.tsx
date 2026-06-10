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
        path: 'game/chess/:id',
        element: (
          <ProtectedRoute>
            <ChessGamePage gameId="chess-001" />
          </ProtectedRoute>
        ),
      },
      {
        path: 'game/sudoku/:id',
        element: (
          <ProtectedRoute>
            <SudokuGamePage gameId="sudoku-001" />
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
    ],
  },
]);