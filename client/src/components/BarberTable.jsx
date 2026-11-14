import { useState, useEffect } from 'react';

// Dữ liệu mẫu ban đầu
const INITIAL_BARBERS = [
  {
    id: 'tho01',
    ten: 'Đặng Chí Dũng',
    sdt: '0901234567',
    chuyenMon: 'Fade cổ điển, Cắt tỉa kéo',
    namKinhNghiem: 8,
  },
  {
    id: 'tho02',
    ten: 'Trương Minh Khang',
    sdt: '0912345678',
    chuyenMon: 'Uốn phom, Tạo kiểu Pompadour',
    namKinhNghiem: 5,
  },
  {
    id: 'tho03',
    ten: 'Lê Hoàng Long',
    sdt: '0923456789',
    chuyenMon: 'Cạo râu truyền thống, Dưỡng da',
    namKinhNghiem: 6,
  },
  {
    id: 'tho04',
    ten: 'Phạm Minh Tuấn',
    sdt: '0934567890',
    chuyenMon: 'Nhuộm màu thời trang, Ép side',
    namKinhNghiem: 4,
  },
  {
    id: 'tho05',
    ten: 'Vũ Quốc Anh',
    sdt: '0945678901',
    chuyenMon: 'Tạo kiểu hiện đại, Cắt layer nam',
    namKinhNghiem: 3,
  },
];

const STORAGE_KEY = 'barbers_data_local';

export default function BarberTable() {
  const [barbers, setBarbers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_BARBERS;
    } catch {
      return INITIAL_BARBERS;
    }
  });

  // Quản lý Modal Thêm / Sửa
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    ten: '',
    sdt: '',
    chuyenMon: '',
    namKinhNghiem: '',
  });

  const [formError, setFormError] = useState('');

  // Lưu vào localStorage mỗi khi danh sách thay đổi
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(barbers));
    } catch (e) {
      console.error('Không thể lưu localStorage:', e);
    }
  }, [barbers]);

  // Mở form thêm
  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setForm({
      ten: '',
      sdt: '',
      chuyenMon: '',
      namKinhNghiem: '',
    });
    setFormError('');
    setModalOpen(true);
  };

  // Mở form sửa
  const handleOpenEdit = (b) => {
    setIsEditing(true);
    setEditingId(b.id);
    setForm({
      ten: b.ten,
      sdt: b.sdt,
      chuyenMon: b.chuyenMon,
      namKinhNghiem: b.namKinhNghiem,
    });
    setFormError('');
    setModalOpen(true);
  };

  // Lưu thợ (Thêm hoặc Sửa)
  const handleSave = (e) => {
    e.preventDefault();
    setFormError('');

    const cleanTen = form.ten.trim();
    const cleanSdt = form.sdt.trim();
    const cleanChuyenMon = form.chuyenMon.trim();
    const kn = Number(form.namKinhNghiem);

    if (!cleanTen) {
      setFormError('Vui lòng nhập tên thợ');
      return;
    }
    if (!cleanSdt) {
      setFormError('Vui lòng nhập số điện thoại');
      return;
    }
    if (!cleanChuyenMon) {
      setFormError('Vui lòng nhập chuyên môn');
      return;
    }
    if (isNaN(kn) || kn < 0) {
      setFormError('Năm kinh nghiệm phải là số >= 0');
      return;
    }

    if (isEditing) {
      // Cập nhật thợ
      setBarbers((prev) =>
        prev.map((b) =>
          b.id === editingId
            ? {
                ...b,
                ten: cleanTen,
                sdt: cleanSdt,
                chuyenMon: cleanChuyenMon,
                namKinhNghiem: kn,
              }
            : b
        )
      );
    } else {
      // Thêm thợ mới
      const newId = 'tho' + (Date.now() % 100000);
      setBarbers((prev) => [
        ...prev,
        {
          id: newId,
          ten: cleanTen,
          sdt: cleanSdt,
          chuyenMon: cleanChuyenMon,
          namKinhNghiem: kn,
        },
      ]);
    }

    setModalOpen(false);
  };

  // Xóa thợ
  const handleDelete = (id, ten) => {
    const confirmDelete = window.confirm(`Bạn có chắc chắn muốn xóa thợ "${ten}" không?`);
    if (confirmDelete) {
      setBarbers((prev) => prev.filter((b) => b.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 p-6 sm:p-10 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* ================= TIÊU ĐỀ ================= */}
        <h1 className="text-3xl font-semibold text-slate-900 mb-4 tracking-tight">
          Quản lý thợ cắt tóc
        </h1>

        {/* ================= NÚT THÊM (XANH DƯƠNG) ================= */}
        <div className="mb-6">
          <button
            type="button"
            onClick={handleOpenAdd}
            className="bg-[#0d6efd] hover:bg-[#0b5ed7] text-white font-medium px-5 py-2 rounded-md shadow-xs transition"
          >
            Thêm
          </button>
        </div>

        {/* ================= BẢNG DANH SÁCH ================= */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900/80">
                <th className="py-3 px-4 font-bold text-slate-900 w-28">Mã thợ</th>
                <th className="py-3 px-4 font-bold text-slate-900">Tên thợ</th>
                <th className="py-3 px-4 font-bold text-slate-900">Số điện thoại</th>
                <th className="py-3 px-4 font-bold text-slate-900">Chuyên môn</th>
                <th className="py-3 px-4 font-bold text-slate-900 text-center">Năm kinh nghiệm</th>
                <th className="py-3 px-4 font-bold text-slate-900 text-right w-44"></th>
              </tr>
            </thead>
            <tbody>
              {barbers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                    Chưa có thợ nào. Hãy bấm nút "Thêm" để thêm thợ mới.
                  </td>
                </tr>
              ) : (
                barbers.map((b) => (
                  <tr key={b.id} className="border-b border-slate-200 hover:bg-slate-50/60">
                    <td className="py-3.5 px-4 text-slate-700 font-mono text-sm">{b.id}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">{b.ten}</td>
                    <td className="py-3.5 px-4 text-slate-700 font-mono text-sm">{b.sdt}</td>
                    <td className="py-3.5 px-4 text-slate-700">{b.chuyenMon}</td>
                    <td className="py-3.5 px-4 text-slate-700 text-center">
                      {b.namKinhNghiem} năm
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {/* Nút Xóa màu xanh theo đúng ảnh mẫu */}
                        <button
                          type="button"
                          onClick={() => handleDelete(b.id, b.ten)}
                          className="bg-[#0d6efd] hover:bg-[#0b5ed7] text-white px-3 py-1 rounded text-sm font-normal shadow-xs transition"
                        >
                          Xóa
                        </button>

                        {/* Dấu phân cách gạch đứng | */}
                        <span className="text-slate-400 font-light px-0.5">|</span>

                        {/* Nút Sửa màu xanh theo đúng ảnh mẫu */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(b)}
                          className="bg-[#0d6efd] hover:bg-[#0b5ed7] text-white px-3 py-1 rounded text-sm font-normal shadow-xs transition"
                        >
                          Sửa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL THÊM / SỬA THỢ ================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
              {isEditing ? 'Sửa thông tin thợ' : 'Thêm thợ cắt tóc mới'}
            </h2>

            {formError && (
              <div className="mb-4 bg-red-50 border border-red-300 text-red-700 px-3 py-2 rounded text-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tên thợ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.ten}
                  onChange={(e) => setForm({ ...form, ten: e.target.value })}
                  placeholder="Nhập họ và tên..."
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0d6efd]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={form.sdt}
                  onChange={(e) => setForm({ ...form, sdt: e.target.value })}
                  placeholder="Ví dụ: 0912345678"
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0d6efd]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Chuyên môn <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.chuyenMon}
                  onChange={(e) => setForm({ ...form, chuyenMon: e.target.value })}
                  placeholder="Ví dụ: Fade, Uốn phom, Cạo râu..."
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0d6efd]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Năm kinh nghiệm
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.namKinhNghiem}
                  onChange={(e) => setForm({ ...form, namKinhNghiem: e.target.value })}
                  placeholder="Ví dụ: 3"
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0d6efd]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-sm text-slate-700 hover:bg-slate-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0d6efd] hover:bg-[#0b5ed7] text-white rounded text-sm font-medium shadow-xs transition"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
