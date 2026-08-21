import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, BookOpen, Building2, ChevronLeft, ChevronRight, Sparkles, AlertCircle, X, Calendar, Users } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000/problems';

export default function App() {
  const [problems, setProblems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [selectedPsNumber, setSelectedPsNumber] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [loadingModal, setLoadingModal] = useState(false);

  // Filter & Page States
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_BASE_URL, {
        params: {
          search: search || undefined,
          sort: sort || undefined,
          page,
          page_size: pageSize
        }
      });
      setProblems(res.data.results);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Error fetching problem statements:', err);
    } finally {
      setLoading(false);
    }
  };

  const openProblemModal = async (psNumber) => {
    setSelectedPsNumber(psNumber);
    setLoadingModal(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/${psNumber}`);
      setModalData(res.data);
    } catch (err) {
      console.error('Error fetching problem details:', err);
    } finally {
      setLoadingModal(false);
    }
  };

  const closeModal = () => {
    setSelectedPsNumber(null);
    setModalData(null);
  };

  useEffect(() => {
    fetchProblems();
  }, [search, sort, page]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedPsNumber) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedPsNumber]);

  const totalPages = Math.ceil(total / pageSize) || 1;

  // Helper to cleanly parse raw dumped text like "Background: ... Description: ..."
  const renderFormattedDescription = (text) => {
    if (!text) return <p className="text-slate-400 text-sm">No detailed description available.</p>;

    // Regex split using lookahead to keep headers with content
    const sections = text.split(/(?=(?:Background:|Description:))/g).filter(Boolean);

    return (
      <div className="flex flex-col gap-4">
        {sections.map((sec, idx) => {
          const isBackground = sec.startsWith('Background:');
          const isDescription = sec.startsWith('Description:');

          let title = 'Overview';
          let content = sec.trim();

          if (isBackground) {
            title = 'Background';
            content = sec.replace(/^Background:/, '').trim();
          } else if (isDescription) {
            title = 'Description';
            content = sec.replace(/^Description:/, '').trim();
          }

          return (
            <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-indigo-400 text-xs font-bold uppercase tracking-wider block mb-2">
                {title}
              </span>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                {content}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-12">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600/20 text-indigo-400 p-2 rounded-lg border border-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              SIH Explorer
            </h1>
          </div>
          <div className="text-xs font-medium px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-slate-400">
            Smart India Hackathon
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-8">
        {/* Search & Controls Section */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search PS ID, Title, or Organization..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex gap-3">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="">Sort By: Default</option>
              <option value="title">Title (A-Z)</option>
              <option value="ideas">Most Submissions</option>
              <option value="deadline">Deadline</option>
            </select>
          </div>
        </div>

        {/* Results Metadata */}
        <div className="flex justify-between items-center text-sm text-slate-400 mb-6">
          <span>Showing <strong className="text-slate-200">{problems.length}</strong> of <strong className="text-slate-200">{total}</strong> problems</span>
          <span>Page {page} of {totalPages}</span>
        </div>

        {/* Grid List */}
        {loading ? (
          <div className="flex justify-center items-center h-64 text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mr-3" />
            Loading problem statements...
          </div>
        ) : problems.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800/60">
            <AlertCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No problem statements match your query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {problems.map((ps) => {
              const fillPercentage = Math.min(100, Math.round((ps.idea_count / (ps.idea_limit || 500)) * 100));
              return (
                <div
                  key={ps.id}
                  onClick={() => openProblemModal(ps.ps_number)}
                  className="group cursor-pointer bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 hover:border-indigo-500/50 hover:bg-slate-900 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Tag Row */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="bg-indigo-500/10 text-indigo-400 text-xs font-semibold px-2.5 py-1 rounded-md border border-indigo-500/20">
                        {ps.ps_number}
                      </span>
                      <span className="text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md truncate max-w-[150px]">
                        {ps.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-slate-100 text-base leading-snug mb-4 group-hover:text-indigo-300 transition-colors line-clamp-2">
                      {ps.title}
                    </h3>

                    {/* Details */}
                    <div className="space-y-2.5 text-xs text-slate-400 mb-6">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                        <span className="truncate">{ps.organization}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-slate-500 shrink-0" />
                        <span className="truncate">{ps.theme}</span>
                      </div>
                    </div>
                  </div>

                  {/* Submission Meter */}
                  <div className="pt-4 border-t border-slate-800/60">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-slate-500">Submissions</span>
                      <span className="text-slate-300 font-medium">{ps.idea_count} / {ps.idea_limit || 500}</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${fillPercentage > 80 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                        style={{ width: `${fillPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Bar */}
        <div className="flex justify-center items-center gap-4 mt-10">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <span className="text-xs font-semibold text-slate-400 px-2">
            {page} / {totalPages}
          </span>

          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 transition-colors"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </main>

{/* Problem Details Modal */}
{selectedPsNumber && (
  <div 
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      backgroundColor: 'rgba(2, 6, 23, 0.85)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}
  >
    <div
      style={{
        backgroundColor: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '850px',
        height: '80vh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}
    >
      {/* Fixed Header */}
      <div 
        style={{
          padding: '20px 24px',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
          backgroundColor: '#0f172a',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          height: '75px',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', fontSize: '12px', fontWeight: '600', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              {selectedPsNumber}
            </span>
            {modalData?.category && (
              <span style={{ backgroundColor: '#1e293b', color: '#cbd5e1', fontSize: '12px', padding: '2px 8px', borderRadius: '4px' }}>
                {modalData.category}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={closeModal}
          style={{ color: '#94a3b8', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px' }}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Guaranteed Scroll Box */}
      <div 
        style={{
          position: 'absolute',
          top: '75px',
          bottom: 0,
          left: 0,
          right: 0,
          overflowY: 'scroll',
          WebkitOverflowScrolling: 'touch',
          padding: '24px'
        }}
      >
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', margin: '0 0 16px 0', lineHeight: '1.4' }}>
          {modalData ? modalData.title : 'Loading details...'}
        </h2>

        {loadingModal ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
            <span>Fetching problem details...</span>
          </div>
        ) : modalData ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Metadata Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', backgroundColor: '#020617', padding: '16px', borderRadius: '12px', border: '1px solid #1e293b' }}>
              <div>
                <span style={{ display: 'block', color: '#64748b', fontSize: '11px', marginBottom: '2px' }}>Organization</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0' }}>{modalData.organization || 'N/A'}</span>
              </div>
              <div>
                <span style={{ display: 'block', color: '#64748b', fontSize: '11px', marginBottom: '2px' }}>Theme</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0' }}>{modalData.theme || 'N/A'}</span>
              </div>
              <div>
                <span style={{ display: 'block', color: '#64748b', fontSize: '11px', marginBottom: '2px' }}>Submissions</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0' }}>{modalData.idea_count || 0} / {modalData.idea_limit || 500}</span>
              </div>
              <div>
                <span style={{ display: 'block', color: '#64748b', fontSize: '11px', marginBottom: '2px' }}>Deadline</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0' }}>{modalData.deadline || 'N/A'}</span>
              </div>
            </div>

            {/* Description Body */}
            {renderFormattedDescription(modalData.description)}
          </div>
        ) : null}
      </div>
    </div>
  </div>
)}
    </div>
  );
}