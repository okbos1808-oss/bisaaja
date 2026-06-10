'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ugyikjdhepainevjfqxg.supabase.co',
  'sb_publishable_VF4ym8FmNw8B9jyRTPH0Xg_yDOPLPco'
);

type Produk = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image_url: string;
};

export default function KatalogSection() {
  const [produk, setProduk] = useState<Produk[]>([]);
  const [filtered, setFiltered] = useState<Produk[]>([]);
  const [kategori, setKategori] = useState('Semua');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) {
        setProduk(data);
        setFiltered(data);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  function handleFilter(kat: string) {
    setKategori(kat);
    setFiltered(kat === 'Semua' ? produk : produk.filter((p) => p.category === kat));
  }

  const kategoriList = [
    'Semua',
    ...Array.from(new Set(produk.map((p) => p.category).filter(Boolean))),
  ];

  return (
    <>
      <style>{`
        .katalog-section {
          background: #0a0a0f;
          padding: 96px 24px;
          position: relative;
          overflow: hidden;
        }
        .katalog-section::before {
          content: '';
          position: absolute;
          top: -200px;
          left: 50%;
          transform: translateX(-50%);
          width: 800px;
          height: 400px;
          background: radial-gradient(ellipse, rgba(109,40,217,0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .katalog-inner {
          max-width: 1200px;
          margin: 0 auto;
        }
        .katalog-eyebrow {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 20px;
        }
        .k-line {
          width: 40px;
          height: 1px;
        }
        .k-line-left { background: linear-gradient(90deg, transparent, #7c3aed); }
        .k-line-right { background: linear-gradient(90deg, #7c3aed, transparent); }
        .katalog-eyebrow-text {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #7c3aed;
          font-family: 'Inter', system-ui, sans-serif;
        }
        .katalog-title {
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 300;
          text-align: center;
          color: #f8f8f8;
          letter-spacing: -0.02em;
          line-height: 1.1;
          margin-bottom: 14px;
          font-family: 'Georgia', 'Times New Roman', serif;
        }
        .katalog-title strong {
          font-weight: 700;
          background: linear-gradient(135deg, #a78bfa, #7c3aed);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .katalog-subtitle {
          text-align: center;
          color: #6b7280;
          font-size: 15px;
          font-family: 'Inter', system-ui, sans-serif;
          margin-bottom: 48px;
        }
        .katalog-divider {
          width: 60px;
          height: 1px;
          background: linear-gradient(90deg, transparent, #7c3aed, transparent);
          margin: 0 auto 48px;
        }
        .filter-wrapper {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
          margin-bottom: 14px;
        }
        .filter-btn {
          padding: 8px 20px;
          border-radius: 2px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border: 1px solid rgba(255,255,255,0.08);
          background: transparent;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: 'Inter', system-ui, sans-serif;
        }
        .filter-btn:hover {
          border-color: rgba(124,58,237,0.5);
          color: #c4b5fd;
        }
        .filter-btn.active {
          background: #7c3aed;
          border-color: #7c3aed;
          color: #fff;
        }
        .katalog-count {
          text-align: center;
          font-size: 11px;
          color: #374151;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-family: 'Inter', system-ui, sans-serif;
          margin-bottom: 40px;
        }
        .produk-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.05);
        }
        @media (max-width: 1024px) {
          .produk-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 640px) {
          .produk-grid { grid-template-columns: repeat(2, 1fr); }
          .katalog-section { padding: 64px 16px; }
        }
        .produk-card {
          background: #0d0d15;
          overflow: hidden;
          cursor: pointer;
          transition: background 0.3s ease;
        }
        .produk-card:hover { background: #121220; }
        .produk-card-image {
          width: 100%;
          aspect-ratio: 4/3;
          overflow: hidden;
          position: relative;
          background: #111120;
        }
        .produk-card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
          filter: brightness(0.8);
        }
        .produk-card:hover .produk-card-image img {
          transform: scale(1.06);
          filter: brightness(1);
        }
        .img-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #111120, #0d0d1e);
          font-size: 2.5rem;
        }
        .img-overlay {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 55%;
          background: linear-gradient(to top, rgba(10,10,15,0.85), transparent);
          pointer-events: none;
        }
        .cat-badge {
          position: absolute;
          top: 12px; left: 12px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #c4b5fd;
          background: rgba(109,40,217,0.25);
          border: 1px solid rgba(124,58,237,0.35);
          padding: 4px 8px;
          font-family: 'Inter', system-ui, sans-serif;
          backdrop-filter: blur(4px);
        }
        .stock-dot {
          position: absolute;
          top: 12px; right: 12px;
          width: 8px; height: 8px;
          border-radius: 50%;
        }
        .stock-dot.on { background: #10b981; box-shadow: 0 0 8px rgba(16,185,129,0.5); }
        .stock-dot.off { background: #374151; }
        .produk-body {
          padding: 16px;
          border-top: 1px solid rgba(255,255,255,0.04);
        }
        .produk-name {
          font-size: 13px;
          font-weight: 500;
          color: #e5e7eb;
          font-family: 'Inter', system-ui, sans-serif;
          margin-bottom: 6px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          letter-spacing: 0.01em;
        }
        .produk-desc {
          font-size: 11px;
          color: #4b5563;
          font-family: 'Inter', system-ui, sans-serif;
          line-height: 1.55;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-bottom: 14px;
          min-height: 34px;
        }
        .produk-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 12px;
          border-top: 1px solid rgba(255,255,255,0.04);
        }
        .produk-price {
          font-size: 14px;
          font-weight: 700;
          color: #a78bfa;
          font-family: 'Inter', system-ui, sans-serif;
          letter-spacing: -0.02em;
        }
        .produk-stok {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-family: 'Inter', system-ui, sans-serif;
        }
        .produk-stok.on { color: #10b981; }
        .produk-stok.off { color: #4b5563; }
        /* Skeleton */
        .skeleton-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.05);
        }
        @media (max-width: 1024px) { .skeleton-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 640px) { .skeleton-grid { grid-template-columns: repeat(2, 1fr); } }
        .skeleton-card { background: #0d0d15; }
        .skeleton-img {
          aspect-ratio: 4/3;
          background: linear-gradient(90deg, #111120 25%, #151528 50%, #111120 75%);
          background-size: 200% 100%;
          animation: shimmer 1.6s infinite;
        }
        .skeleton-body { padding: 16px; }
        .skeleton-line {
          height: 10px;
          border-radius: 1px;
          margin-bottom: 8px;
          background: linear-gradient(90deg, #111120 25%, #151528 50%, #111120 75%);
          background-size: 200% 100%;
          animation: shimmer 1.6s infinite;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <section className="katalog-section">
        <div className="katalog-inner">

          {/* Header */}
          <div className="katalog-eyebrow">
            <span className="k-line k-line-left" />
            <span className="katalog-eyebrow-text">Koleksi Kami</span>
            <span className="k-line k-line-right" />
          </div>

          <h2 className="katalog-title">
            Produk <strong>Unggulan</strong>
          </h2>
          <p className="katalog-subtitle">
            Dipilih dengan teliti untuk memenuhi standar kualitas tertinggi
          </p>
          <div className="katalog-divider" />

          {/* Filter */}
          <div className="filter-wrapper">
            {kategoriList.map((k) => (
              <button
                key={k}
                onClick={() => handleFilter(k)}
                className={`filter-btn ${kategori === k ? 'active' : ''}`}
              >
                {k}
              </button>
            ))}
          </div>

          <p className="katalog-count">{filtered.length} Produk</p>

          {/* Cards */}
          {loading ? (
            <div className="skeleton-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-img" />
                  <div className="skeleton-body">
                    <div className="skeleton-line" style={{ width: '55%' }} />
                    <div className="skeleton-line" style={{ width: '85%' }} />
                    <div className="skeleton-line" style={{ width: '40%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="produk-grid">
              {filtered.map((p) => (
                <div key={p.id} className="produk-card">
                  <div className="produk-card-image">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} />
                    ) : (
                      <div className="img-placeholder">📦</div>
                    )}
                    <div className="img-overlay" />
                    {p.category && <span className="cat-badge">{p.category}</span>}
                    <span className={`stock-dot ${p.stock > 0 ? 'on' : 'off'}`} />
                  </div>
                  <div className="produk-body">
                    <p className="produk-name">{p.name}</p>
                    <p className="produk-desc">{p.description}</p>
                    <div className="produk-footer">
                      <span className="produk-price">
                        Rp {Number(p.price).toLocaleString('id-ID')}
                      </span>
                      <span className={`produk-stok ${p.stock > 0 ? 'on' : 'off'}`}>
                        {p.stock > 0 ? `${p.stock} stok` : 'Habis'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>
    </>
  );
}