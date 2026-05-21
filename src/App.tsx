/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import BlogPage from './pages/BlogPage';
import BlogArticlePage from './pages/BlogArticlePage';
import AdminLayout from './pages/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminArticlesPage from './pages/AdminArticlesPage';
import AdminArticleEditor from './pages/AdminArticleEditor';
import AdminLeadsPage from './pages/AdminLeadsPage';
import AdminTrialPoolPage from './pages/AdminTrialPoolPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import AdminBotSettingsPage from './pages/AdminBotSettingsPage';
import AdminArticleBotPage from './pages/AdminArticleBotPage';
import AdminRedditScoutPage from './pages/AdminRedditScoutPage';
import AdminPinterestPinsPage from './pages/AdminPinterestPinsPage';
import RequireAuth from './components/RequireAuth';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogArticlePage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Admin (auth required, admin role) */}
        <Route path="/admin" element={<RequireAuth requireAdmin><AdminLayout /></RequireAuth>}>
          <Route index element={<AdminDashboard />} />
          <Route path="articles" element={<AdminArticlesPage />} />
          <Route path="articles/:id" element={<AdminArticleEditor />} />
          <Route path="leads" element={<AdminLeadsPage />} />
          <Route path="trial-pool" element={<AdminTrialPoolPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="bot" element={<AdminBotSettingsPage />} />
          <Route path="article-bot" element={<AdminArticleBotPage />} />
          <Route path="reddit" element={<AdminRedditScoutPage />} />
          <Route path="pinterest-pins" element={<AdminPinterestPinsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
