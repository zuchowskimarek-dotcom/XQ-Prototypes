import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { DomainListPage } from './pages/DomainListPage';
import { DomainOverviewPage } from './pages/DomainOverviewPage';
import { ScopeEditorPage } from './pages/ScopeEditorPage';
import { SchemaEditorPage } from './pages/SchemaEditorPage';
import { ManifestViewerPage } from './pages/ManifestViewerPage';
import { BulkManifestViewerPage } from './pages/BulkManifestViewerPage';
import './styles/variables.css';
import './styles/global.css';
import './App.css';

function NavHeader() {
  const location = useLocation();
  const isSchema = location.pathname === '/schema';

  return (
    <header className="app-header">
      <div className="app-logo">
        <Link to="/" className="logo-link">
          <span className="logo-mark">XQ</span>
          <span className="logo-text">Policy Dashboard</span>
        </Link>
      </div>
      <nav className="app-nav">
        <Link to="/schema" className={`nav-link ${isSchema ? 'active' : ''}`}>
          Schema
        </Link>
      </nav>
    </header>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <NavHeader />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<DomainListPage />} />
            <Route path="/domains/:domainId" element={<DomainOverviewPage />} />
            <Route path="/domains/:domainId/scopes/:scopeId" element={<ScopeEditorPage />} />
            <Route path="/schema" element={<SchemaEditorPage />} />
            <Route path="/domains/:domainId/manifest" element={<ManifestViewerPage />} />
            <Route path="/manifests/all" element={<BulkManifestViewerPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
