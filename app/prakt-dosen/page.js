'use client';

import { useEffect, useState } from 'react';

const GRAPHQL_ENDPOINT = 'http://localhost:1337/graphql';

// GraphQL Queries
const GET_ALL_DOSEN = `
  query GetAllDosen {
    dosens(pagination: { limit: 100 }) {
      documentId
      nidn
      nama
      email
      telepon
      jabatan
      prodi {
        kode_prodi
        nama_prodi
      }
    }
  }
`;

const CREATE_DOSEN_MUTATION = `
  mutation CreateDosen($data: DosenInput!) {
    createDosen(data: $data) {
      documentId
      nidn
      nama
      email
      telepon
      jabatan
    }
  }
`;

const UPDATE_DOSEN_MUTATION = `
  mutation UpdateDosen($documentId: ID!, $data: DosenInput!) {
    updateDosen(documentId: $documentId, data: $data) {
      documentId
      nidn
      nama
      email
      telepon
      jabatan
    }
  }
`;

const DELETE_DOSEN_MUTATION = `
  mutation DeleteDosen($documentId: ID!) {
    deleteDosen(documentId: $documentId) {
      documentId
    }
  }
`;

export default function DosenGraphQLPage() {
  const [dosenList, setDosenList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedDosen, setSelectedDosen] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    nidn: '',
    nama: '',
    email: '',
    telepon: '',
    jabatan: ''
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const graphqlRequest = async (query, variables = {}) => {
    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables
        }),
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      return result.data;
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const fetchDosen = async () => {
    setLoading(true);
    try {
      const data = await graphqlRequest(GET_ALL_DOSEN);

      // 1️⃣ TANPA EKSTRAKSI (RAW RESPONSE)
      console.group('GRAPHQL RAW RESPONSE (Tanpa Ekstraksi)');
      console.log(data);
      console.groupEnd();
      
      // 2️⃣ DENGAN EKSTRAKSI
      console.group('GRAPHQL RESPONSE (Dengan Ekstraksi)');
      console.log(data.dosens);
      console.groupEnd();

      // RELATIONAL FILED TANPA ATTRIBUTES
      console.group('Relational Field Tanpa attributes');
      console.log(data.dosens);
      console.groupEnd();

      setDosenList(data.dosens || []);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDosen();
  }, []);

  const handleViewDetail = (dos) => {
    setSelectedDosen(dos);
    setShowDetailModal(true);
  };

  const handleCreate = () => {
    setCreateFormData({
      nidn: '',
      nama: '',
      email: '',
      telepon: '',
      jabatan: ''
    });
    setShowCreateModal(true);
  };

  const handleCreateFormChange = (e) => {
    const { name, value } = e.target;
    setCreateFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveCreate = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formattedData = {
        ...createFormData,
        publishedAt: new Date().toISOString(),
      };

      await graphqlRequest(CREATE_DOSEN_MUTATION, {
        data: formattedData
      });

      alert('Data berhasil ditambahkan!');
      setShowCreateModal(false);
      fetchDosen();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (dos) => {
    setEditFormData({
      documentId: dos.documentId,
      nidn: dos.nidn || '',
      nama: dos.nama || '',
      email: dos.email || '',
      telepon: dos.telepon || '',
      jabatan: dos.jabatan || ''
    });
    setShowEditModal(true);
    setShowDetailModal(false);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formattedData = {
        ...editFormData
      };
      delete formattedData.documentId; 

      await graphqlRequest(UPDATE_DOSEN_MUTATION, {
        // documentId: editFormData.documentId,
        data: formattedData
      });

      alert('Data berhasil diupdate!');
      setShowEditModal(false);
      setEditFormData(null);
      fetchDosen();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (dos) => {
    setDeleteTarget(dos);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await graphqlRequest(DELETE_DOSEN_MUTATION, {
        // documentId: deleteTarget.documentId
      });

      alert('Data berhasil dihapus!');
      setShowDeleteModal(false);
      setDeleteTarget(null);
      fetchDosen();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const closeModal = () => {
    setShowDetailModal(false);
    setSelectedDosen(null);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditFormData(null);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setCreateFormData({
      nidn: '',
      nama: '',
      email: '',
      telepon: '',
      jabatan: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <div>
                <h1 className="text-3xl font-bold text-white">Data Dosen (GraphQL)</h1>
                <p className="text-purple-100 mt-1">CRUD dosen menggunakan GraphQL</p>
              </div>
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah Data
            </button>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400 animate-pulse">Memuat data...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-red-700 dark:text-red-400">Error</h3>
                    <p className="text-red-600 dark:text-red-300 mt-1">{error}</p>
                    <button
                      onClick={fetchDosen}
                      className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Coba Lagi
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Data Table */}
            {!loading && !error && (
              <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-700/50">
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        No
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        NIDN
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Nama Dosen
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Jabatan
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {dosenList.map((dos, index) => (
                      <tr
                        key={dos.documentId}
                        className="hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-bold text-sm">
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-mono text-sm font-medium">
                            {dos.nidn || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                              {dos.nama ? dos.nama.charAt(0).toUpperCase() : '?'}
                            </div>
                            <span className="text-gray-900 dark:text-gray-100 font-medium">
                              {dos.nama || '-'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-900 dark:text-gray-100 font-medium">
                            {dos.jabatan || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-600 dark:text-gray-400 text-sm">
                            {dos.email || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewDetail(dos)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                              title="Lihat Detail"
                            >
                              Detail
                            </button>
                            <button
                              onClick={() => handleEdit(dos)}
                              className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-medium rounded-lg transition-colors"
                              title="Edit"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(dos)}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors"
                              title="Hapus"
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Empty State */}
                {dosenList.length === 0 && (
                  <div className="text-center py-16">
                    <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">Tidak ada data dosen</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Belum ada dosen yang terdaftar dalam sistem</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {!loading && !error && dosenList.length > 0 && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-700 px-8 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Menampilkan <span className="font-bold text-purple-600 dark:text-purple-400">{dosenList.length}</span> data dosen
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    GraphQL API
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* GraphQL Query Info Card */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            GraphQL Queries & Mutations
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Query (Read):</h4>
              <pre className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 overflow-x-auto">
                <code className="text-sm text-green-400 font-mono">
                  {`query GetAllDosen {
  dosens {
    documentId
    nidn
    nama
    email
    telepon
    jabatan
  }
}`}
                </code>
              </pre>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Mutation (Create):</h4>
              <pre className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 overflow-x-auto">
                <code className="text-sm text-blue-400 font-mono">
                  {`mutation CreateDosen($data: DosenInput!) {
  createDosen(data: $data) {
    documentId
    nidn
    nama
    email
    telepon
    jabatan
  }
}`}
                </code>
              </pre>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Mutation (Update):</h4>
              <pre className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 overflow-x-auto">
                <code className="text-sm text-blue-400 font-mono">
                  {` mutation UpdateDosen($documentId: ID!, $data: DosenInput!) {
  updateDosen(documentId: $documentId, data: $data) {
    documentId
    nidn
    nama
    email
    telepon
    jabatan
  }
}`}
                </code>
              </pre>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Mutation (Delete):</h4>
              <pre className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 overflow-x-auto">
                <code className="text-sm text-blue-400 font-mono">
                  {`mutation DeleteDosen($documentId: ID!) {
  deleteDosen(documentId: $documentId) {
    documentId
  }
}`}
                </code>
              </pre>
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            Endpoint: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">{GRAPHQL_ENDPOINT}</code>
          </p>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedDosen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex justify-between items-center sticky top-0">
              <h2 className="text-2xl font-bold text-white">Detail Dosen</h2>
              <button
                onClick={closeModal}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">NIDN</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedDosen.nidn}</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Nama Lengkap</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedDosen.nama}</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedDosen.email}</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">No Telepon</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedDosen.telepon}</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg md:col-span-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Jabatan</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedDosen.jabatan}</p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Informasi Sistem</h3>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Document ID:</span>
                    <span className="text-gray-900 dark:text-gray-100 font-mono text-xs">{selectedDosen.documentId}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100 rounded-lg transition-colors"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  closeModal();
                  handleEdit(selectedDosen);
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Edit Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editFormData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-yellow-600 to-orange-600 px-6 py-4 flex justify-between items-center sticky top-0">
              <h2 className="text-2xl font-bold text-white">Edit Data Dosen</h2>
              <button
                onClick={closeEditModal}
                className="text-white hover:text-gray-200 transition-colors"
                disabled={saving}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content - Form */}
            <form onSubmit={handleSaveEdit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* NIDN */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    NIDN <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nidn"
                    value={editFormData.nidn}
                    onChange={handleEditFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                {/* Nama */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nama"
                    value={editFormData.nama}
                    onChange={handleEditFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                {/* Telepon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    No Telepon <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="telepon"
                    value={editFormData.telepon}
                    onChange={handleEditFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                {/* Jabatan */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Jabatan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="jabatan"
                    value={editFormData.jabatan}
                    onChange={handleEditFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={saving}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan Perubahan'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex justify-between items-center sticky top-0">
              <h2 className="text-2xl font-bold text-white">Tambah Data Dosen</h2>
              <button
                onClick={closeCreateModal}
                className="text-white hover:text-gray-200 transition-colors"
                disabled={saving}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content - Form */}
            <form onSubmit={handleSaveCreate} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* NIDN */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    NIDN <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nidn"
                    value={createFormData.nidn}
                    onChange={handleCreateFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Masukkan NIDN"
                  />
                </div>

                {/* Nama */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nama"
                    value={createFormData.nama}
                    onChange={handleCreateFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={createFormData.email}
                    onChange={handleCreateFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="contoh@email.com"
                  />
                </div>

                {/* Telepon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    No Telepon <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="telepon"
                    value={createFormData.telepon}
                    onChange={handleCreateFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="081234567890"
                  />
                </div>

                {/* Jabatan */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Jabatan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="jabatan"
                    value={createFormData.jabatan}
                    onChange={handleCreateFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Masukkan jabatan (Contoh: Dosen Tetap)"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  disabled={saving}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Menyimpan...
                    </>
                  ) : (
                    'Tambah Data'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h2 className="text-2xl font-bold text-white">Konfirmasi Hapus</h2>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
                Apakah Anda yakin ingin menghapus data dosen:
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                <p className="font-bold text-xl text-red-900 dark:text-red-100">{deleteTarget.nama}</p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">NIDN: {deleteTarget.nidn}</p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ⚠️ Data yang sudah dihapus tidak dapat dikembalikan!
              </p>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex gap-3 rounded-b-2xl">
              <button
                onClick={cancelDelete}
                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100 font-semibold rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}