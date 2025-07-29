"use client";

import { useEffect, useState, useMemo } from 'react';

export default function ViewOrders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const ITEMS_PER_PAGE = 20;
//use axios 
  async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch('/api/getallusersDetail', { cache: "no-store" });
        const json = await res.json();
        if (json.success) {
          setOrders(json.data);
          setFilteredOrders(json.data);
        } else {
          console.error('[API Error]', json.message);
        }
      } catch (err) {
        console.error('[Network Error]', err);
      } finally {
        setLoading(false);
      }
    }
  
    useEffect(() => {  
    fetchData();
  }, []);

  useEffect(() => {
    const lower = search.toLowerCase();
    const filtered = orders.filter(
      (order) =>
        order.name.toLowerCase().includes(lower) ||
        order.phone.toLowerCase().includes(lower)
    );
    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [search, orders]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  const getFileExtension = (mimeType) => {
    const map = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/svg+xml': 'svg',
    };
    return map[mimeType] || 'png';
  };

  const handleDownload = async (url, baseName) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const extension = getFileExtension(blob.type);
      const fileName = `${baseName}.${extension}`;
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('[Download Error]', err);
    }
  };

  return (
    <div className="p-6 overflow-x-auto">
      <h2 className="text-2xl font-bold mb-4">Standee Orders</h2>

      <input
        type="text"
        placeholder="Search by name or phone"
        className="border p-2 mb-4 w-full max-w-md"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse flex gap-4 border p-4 rounded bg-gray-100">
              <div className="h-12 w-12 bg-gray-300 rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-1/2" />
                <div className="h-4 bg-gray-300 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <table className="table-auto w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Serial Number</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Phone</th>
                <th className="p-2 border">Standee Type</th>
                <th className="p-2 border">Icons</th>
                <th className="p-2 border">Other Icons</th>
                <th className="p-2 border">Logo Is</th>
                <th className="p-2 border">UPI QR</th>
                <th className="p-2 border">Download</th>
                <th className="p-2 border">Created At</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order, index) => {
                const hasUPI = order.icons_selected?.includes('UPI');
                return (
                  <tr key={index} className="text-center">
                    <td className="p-2 border">
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </td>
                    <td className="p-2 border">{order.name}</td>
                    <td className="p-2 border">{order.phone}</td>
                    <td className="p-2 border">{order.standee_type}</td>
                    <td className="p-2 border">
                      {Array.isArray(order.icons_selected)
                        ? order.icons_selected.join(', ')
                        : '--'}
                    </td>
                    <td className="p-2 border">
                      {order.other_icons?.trim() ? order.other_icons : '--'}
                    </td>
                    <td className="p-2 border">
                      {order.logo_url ? (
                        <img
                          src={order.logo_url}
                          alt="Logo"
                          className="h-12 mx-auto rounded"
                        />
                      ) : (
                        'No Logo'
                      )}
                    </td>
                    <td className="p-2 border">
                      {hasUPI ? (
                        order.upi_qr_url ? (
                          <div className="flex flex-col items-center gap-1">
                            <img
                              src={order.upi_qr_url}
                              alt="UPI QR"
                              className="h-12 mx-auto"
                            />
                            <button
                              onClick={() =>
                                handleDownload(order.upi_qr_url, `${order.phone}-upi`)
                              }
                              className="text-blue-600 underline text-sm"
                            >
                              Download UPI
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">No QR</span>
                        )
                      ) : (
                        '--'
                      )}
                    </td>
                    <td className="p-2 border">
                      {order.logo_url ? (
                        <button
                          onClick={() =>
                            handleDownload(order.logo_url, `${order.phone}-logo`)
                          }
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                        >
                          Download
                        </button>
                      ) : (
                        '--'
                      )}
                    </td>
                    <td className="p-2 border">
                      {order.created_at ? (
                        <div>
                          <b>
                            <div>
                              {new Date(order.created_at).toLocaleDateString()}
                            </div>
                          </b>
                          <div>
                            {new Date(order.created_at).toLocaleTimeString()}
                          </div>
                        </div>
                      ) : (
                        '--'
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="mt-4 flex justify-center gap-2 items-center">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 border rounded ${
                  currentPage === i + 1 ? 'bg-blue-500 text-white' : ''
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
