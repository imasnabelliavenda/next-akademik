'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [dosen, setDosen] = useState([]);
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

  const fetchDosen = () => {
    setLoading(true);
    fetch('http://localhost:1337/api/dosens')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        return response.json();
      })
      .then(data => {
        setDosen(data.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
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
    const response = await fetch('http://localhost:1337/api/dosens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
            nidn: createFormData.nidn,
            nama: createFormData.nama,
            email: createFormData.email,
            telepon: createFormData.telepon,
            jabatan: createFormData.jabatan
        }
      })
    });

    const result = await response.json();
    console.log('CREATE RESPONSE:', result);

    if (!response.ok) {
      throw new Error(result.error?.message || 'Create gagal');
    }

    alert('Data berhasil ditambahkan!');
    setShowCreateModal(false);
    fetchDosen();
  } catch (err) {
    console.error(err);
    alert(err.message);
  } finally {
    setSaving(false);
  }
};


  const handleEdit = (dos) => {
    setEditFormData({
      id: dos.id,
      documentId: dos.documentId,
      nidn: dos.nidn,
      nama: dos.nama,
      email: dos.email,
      telepon: dos.telepon,
      jabatan: dos.jabatan
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
      const response = await fetch(`http://localhost:1337/api/dosens/${editFormData.documentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            nidn: editFormData.nidn,
            nama: editFormData.nama,
            email: editFormData.email,
            telepon: editFormData.telepon,
            jabatan: editFormData.jabatan
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update data');
      }

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
      const response = await fetch(`http://localhost:1337/api/dosens/${deleteTarget.documentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete data');
      }

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
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Data Dosen</h1>
              <p className="text-blue-100 mt-2">Daftar dosen terdaftar</p>
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
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
                <p className="font-semibold">Error:</p>
                <p>{error}</p>
              </div>
            )}

            {!loading && !error && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">No</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">NIDN</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Nama</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Telepon</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Jabatan</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dosen.map((dos, index) => (
                      <tr
                        key={dos.id}
                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">{index + 1}</td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{dos.nidn}</td>
                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">{dos.nama}</td>
                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">{dos.email}</td>
                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{dos.telepon}</td>
                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{dos.jabatan}</td>
                        <td className="px-4 py-4 text-sm">
                          <div className="flex gap-2 justify-center">
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

                {dosen.length === 0 && (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    Tidak ada data dosen
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {!loading && !error && dosen.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700/50 px-8 py-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total: <span className="font-semibold text-gray-900 dark:text-gray-100">{dosen.length}</span> dosen
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedDosen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center sticky top-0">
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
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedDosen.nim}</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Nama Lengkap</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedDosen.nama}</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedDosen.email}</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg md:col-span-2">
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
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Dibuat:</span>
                    <span className="text-gray-900 dark:text-gray-100">{formatDate(selectedDosen.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Diupdate:</span>
                    <span className="text-gray-900 dark:text-gray-100">{formatDate(selectedDosen.updatedAt)}</span>
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
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
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

                {/* No Telp */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email <span className="text-red-500">*</span>
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

                {/* Alamat */}
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
                    name="state"
                    value={createFormData.state}
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