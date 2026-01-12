'use client';

import { useEffect, useState } from 'react';

const GRAPHQL_ENDPOINT = 'http://localhost:1337/graphql';

// GraphQL Queries
const GET_ALL_MHS = `
  query GetAllMhs {
    mahasiswas(pagination: { limit: 100 }) {
      documentId
      nim
      nama
      angkatan
      jenis_kelamin
      tanggal_lahir
      alamat
      email
      status_mahasiswa
    }
  }
`;

const CREATE_MHS_MUTATION = `
  mutation CreateMahasiswa($data: MahasiswaInput!) {
    createMahasiswa(data: $data) {
      documentId
      nim
      nama
      angkatan
      jenis_kelamin
      tanggal_lahir
      alamat
      email
      status_mahasiswa
    }
  }
`;

const UPDATE_MHS_MUTATION = `
  mutation UpdateMahasiswa($documentId: ID!, $data: MahasiswaInput!) {
    updateMahasiswa(documentId: $documentId, data: $data) {
      documentId
      nim
      nama
      angkatan
      jenis_kelamin
      tanggal_lahir
      alamat
      email
      status_mahasiswa
    }
  }
`;

const DELETE_MHS_MUTATION = `
  mutation DeleteMahasiswa($documentId: ID!) {
    deleteMahasiswa(documentId: $documentId) {
      documentId
    }
  }
`;


export default function MhsGraphQLPage() {
  const [mhsList, setMhsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State untuk modal
  const [selectedMahasiswa, setSelectedMahasiswa] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    nim: '',
    nama: '',
    angkatan: '',
    jenis_kelamin: 'L',
    tanggal_lahir: '',
    alamat: '',
    email: '',
    status_mahasiswa: 'aktif'
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Fungsi GraphQL Request
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

  // Fetch data dengan GraphQL
  const fetchMhs = async () => {
    setLoading(true);
    try {
      const data = await graphqlRequest(GET_ALL_MHS);
      setMhsList(data.mahasiswas || []);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMhs();
  }, []);

  // Format tanggal
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  function formatDateForInput(date) {
    if (!date) return '';
    // kalau ISO → ambil YYYY-MM-DD
    if (typeof date === 'string' && date.includes('T')) {
        return date.split('T')[0];
    }
    return date;
    }

  // Handler untuk modal detail
  const handleViewDetail = (mhs) => {
    setSelectedMahasiswa(mhs);
    setShowDetailModal(true);
  };

  // Handler untuk create
  const handleCreate = () => {
    setCreateFormData({
      nim: '',
      nama: '',
      angkatan: '',
      jenis_kelamin: 'L',
      tanggal_lahir: '',
      alamat: '',
      email: '',
      status_mahasiswa: 'aktif'
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
        tanggal_lahir: createFormData.tanggal_lahir || null,
        publishedAt: new Date().toISOString(),
        };

        await graphqlRequest(CREATE_MHS_MUTATION, {
        data: formattedData
        });

        alert('Data berhasil ditambahkan!');
        setShowCreateModal(false);
        fetchMhs();
    } catch (err) {
        alert(`Error: ${err.message}`);
    } finally {
        setSaving(false);
    }
    };

  // Handler untuk edit
  const handleEdit = (mhs) => {
    setEditFormData({
      documentId: mhs.documentId,
      nim: mhs.nim || '',
      nama: mhs.nama || '',
      angkatan: mhs.angkatan || '',
      jenis_kelamin: mhs.jenis_kelamin || 'L',
      tanggal_lahir: formatDateForInput(mhs.tanggal_lahir),
      alamat: mhs.alamat || '',
      email: mhs.email || '',
      status_mahasiswa: mhs.status_mahasiswa || 'aktif'
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
      delete formattedData.documentId; // Hapus documentId dari data yang akan diupdate

      await graphqlRequest(UPDATE_MHS_MUTATION, {
        documentId: editFormData.documentId,
        data: formattedData
      });

      alert('Data berhasil diupdate!');
      setShowEditModal(false);
      setEditFormData(null);
      fetchMhs(); // Refresh data
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Handler untuk delete
  const handleDelete = (mhs) => {
    setDeleteTarget(mhs);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await graphqlRequest(DELETE_MHS_MUTATION, {
        documentId: deleteTarget.documentId
      });

      alert('Data berhasil dihapus!');
      setShowDeleteModal(false);
      setDeleteTarget(null);
      fetchMhs(); // Refresh data
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  // Close modal functions
  const closeModal = () => {
    setShowDetailModal(false);
    setSelectedMahasiswa(null);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditFormData(null);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setCreateFormData({
      nim: '',
      nama: '',
      angkatan: '',
      jenis_kelamin: 'L',
      tanggal_lahir: '',
      alamat: '',
      email: '',
      status_mahasiswa: 'aktif'
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <div>
                <h1 className="text-3xl font-bold text-white">Data Mahasiswa (GraphQL)</h1>
                <p className="text-purple-100 mt-1">CRUD mahasiswa menggunakan GraphQL</p>
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
                      onClick={fetchMhs}
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
                        NIM
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Nama Mahasiswa
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Angkatan
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {mhsList.map((mhs, index) => (
                      <tr
                        key={mhs.documentId}
                        className="hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-bold text-sm">
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-mono text-sm font-medium">
                            {mhs.nim || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                              {mhs.nama ? mhs.nama.charAt(0).toUpperCase() : '?'}
                            </div>
                            <span className="text-gray-900 dark:text-gray-100 font-medium">
                              {mhs.nama || '-'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-900 dark:text-gray-100 font-medium">
                            {mhs.angkatan || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${mhs.status_mahasiswa === 'aktif'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                            {mhs.status_mahasiswa || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewDetail(mhs)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                              title="Lihat Detail"
                            >
                              Detail
                            </button>
                            <button
                              onClick={() => handleEdit(mhs)}
                              className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-medium rounded-lg transition-colors"
                              title="Edit"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(mhs)}
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
                {mhsList.length === 0 && (
                  <div className="text-center py-16">
                    <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">Tidak ada data mahasiswa</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Belum ada mahasiswa yang terdaftar dalam sistem</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {!loading && !error && mhsList.length > 0 && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-700 px-8 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Menampilkan <span className="font-bold text-purple-600 dark:text-purple-400">{mhsList.length}</span> data mahasiswa
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
                  {`query GetAllMahasiswa {
  mahasiswas {
    documentId
    nim
    nama
    angkatan
    jenis_kelamin
    tanggal_lahir
    alamat
    email
    status_mahasiswa
  }
}`}
                </code>
              </pre>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Mutation (Create):</h4>
              <pre className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 overflow-x-auto">
                <code className="text-sm text-blue-400 font-mono">
                  {`mutation CreateMahasiswa($data: MahasiswaInput!) {
  createMahasiswa(data: $data) {
    documentId
    nim
    nama
    angkatan
    jenis_kelamin
    tanggal_lahir
    alamat
    email
    status_mahasiswa
  }
}`}
                </code>
              </pre>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Mutation (Update):</h4>
              <pre className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 overflow-x-auto">
                <code className="text-sm text-blue-400 font-mono">
                  {`mutation UpdateMahasiswa($documentId: ID!, $data: MahasiswaInput!) {
    updateMahasiswa(documentId: $documentId, data: $data) {
      documentId
      nim
      nama
      angkatan
      jenis_kelamin
      tanggal_lahir
      alamat
      email
      status_mahasiswa
    }
}
`}
                </code>
              </pre>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Mutation (Delete):</h4>
              <pre className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 overflow-x-auto">
                <code className="text-sm text-blue-400 font-mono">
                  {`mutation DeleteMahasiswa($documentId: ID!) {
    deleteMahasiswa(documentId: $documentId) {
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
      {showDetailModal && selectedMahasiswa && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex justify-between items-center sticky top-0">
              <h2 className="text-2xl font-bold text-white">Detail Mahasiswa</h2>
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
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">NIM</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedMahasiswa.nim}</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Nama Lengkap</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedMahasiswa.nama}</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Angkatan</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedMahasiswa.angkatan}</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Jenis Kelamin</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {selectedMahasiswa.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tanggal Lahir</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{formatDate(selectedMahasiswa.tanggal_lahir)}</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${selectedMahasiswa.status_mahasiswa === 'aktif'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                    {selectedMahasiswa.status_mahasiswa}
                  </span>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg md:col-span-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedMahasiswa.email}</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg md:col-span-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Alamat</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedMahasiswa.alamat}</p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Informasi Sistem</h3>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Document ID:</span>
                    <span className="text-gray-900 dark:text-gray-100 font-mono text-xs">{selectedMahasiswa.documentId}</span>
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
                  handleEdit(selectedMahasiswa);
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
              <h2 className="text-2xl font-bold text-white">Edit Data Mahasiswa</h2>
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
                {/* NIM */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    NIM <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nim"
                    value={editFormData.nim}
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

                {/* Angkatan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Angkatan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="angkatan"
                    value={editFormData.angkatan}
                    onChange={handleEditFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                {/* Jenis Kelamin */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Jenis Kelamin <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="jenis_kelamin"
                    value={editFormData.jenis_kelamin}
                    onChange={handleEditFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>

                {/* Tanggal Lahir */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tanggal Lahir <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="tanggal_lahir"
                    value={editFormData.tanggal_lahir}
                    onChange={handleEditFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status_mahasiswa"
                    value={editFormData.status_mahasiswa}
                    onChange={handleEditFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="cuti">Cuti</option>
                    <option value="lulus">Lulus</option>
                    <option value="DO">DO</option>
                  </select>
                </div>

                {/* Email */}
                <div className="md:col-span-2">
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

                {/* Alamat */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Alamat <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="alamat"
                    value={editFormData.alamat}
                    onChange={handleEditFormChange}
                    required
                    rows={3}
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
              <h2 className="text-2xl font-bold text-white">Tambah Data Mahasiswa</h2>
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
                {/* NIM */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    NIM <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nim"
                    value={createFormData.nim}
                    onChange={handleCreateFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Masukkan NIM"
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

                {/* Angkatan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Angkatan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="angkatan"
                    value={createFormData.angkatan}
                    onChange={handleCreateFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Contoh: 2022"
                  />
                </div>

                {/* Jenis Kelamin */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Jenis Kelamin <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="jenis_kelamin"
                    value={createFormData.jenis_kelamin}
                    onChange={handleCreateFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>

                {/* Tanggal Lahir */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tanggal Lahir <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="tanggal_lahir"
                    value={createFormData.tanggal_lahir}
                    onChange={handleCreateFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status_mahasiswa"
                    value={createFormData.status_mahasiswa}
                    onChange={handleCreateFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="cuti">Cuti</option>
                    <option value="lulus">Lulus</option>
                    <option value="DO">DO</option>
                  </select>
                </div>

                {/* Email */}
                <div className="md:col-span-2">
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

                {/* Alamat */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Alamat <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="alamat"
                    value={createFormData.alamat}
                    onChange={handleCreateFormChange}
                    required
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Masukkan alamat lengkap"
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
                Apakah Anda yakin ingin menghapus data mahasiswa:
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                <p className="font-bold text-xl text-red-900 dark:text-red-100">{deleteTarget.nama}</p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">NIM: {deleteTarget.nim}</p>
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