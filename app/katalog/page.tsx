// app/katalog/page.tsx
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

export default function KatalogPage() {
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

  const kategoriList = ['Semua', ...Array.from(new Set(produk.map(p => p.category).filter(Boolean)))];

  function handleFilter(kat: string) {
    setKategori(kat);
    setFiltered(kat === 'Semua' ? produk : produk.filter(p => p.category === kat));
  }

  return (
    <section className="py-16 px-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-semibold text-center mb-2">Katalog Produk</h2>
      <p className="text-center text-gray-500 mb-8">Temukan produk unggulan kami</p>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {kategoriList.map(k => (
          <button
            key={k}
            onClick={() => handleFilter(k)}
            className={`px-4 py-1.5 rounded-full text-sm border transition ${
              kategori === k
                ? 'bg-purple-700 text-white border-purple-700'
                : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'
            }`}
          >
            {k}
          </button>
        ))}
      </div>

      <p className="text-center text-sm text-gray-400 mb-6">{filtered.length} produk ditemukan</p>

      {loading ? (
        <p className="text-center text-gray-400">Memuat produk...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(p => (
            <div key={p.id} className="border rounded-xl overflow-hidden hover:shadow-md transition">
              <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-300 text-4xl">📦</span>
                )}
              </div>
              <div className="p-3">
                {p.category && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{p.category}</span>
                )}
                <p className="font-medium text-sm mt-1 truncate">{p.name}</p>
                <p className="text-xs text-gray-400 line-clamp-2 mt-1">{p.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-purple-700 font-semibold text-sm">
                    Rp {Number(p.price).toLocaleString('id-ID')}
                  </span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {p.stock > 0 ? 'Tersedia' : 'Habis'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Stok: {p.stock}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}