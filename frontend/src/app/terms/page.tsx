export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FAF8FF] py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-[12px] border border-[#C3C6D7] p-8 shadow-sm">
        <h1 className="text-[28px] font-bold text-[#191B23] mb-2">Syarat dan Ketentuan</h1>
        <p className="text-[13px] text-[#737686] mb-8">Terakhir diperbarui: Mei 2025</p>

        <div className="flex flex-col gap-6 text-[14px] text-[#434655] leading-relaxed">
          <section>
            <h2 className="text-[16px] font-bold text-[#191B23] mb-2">1. Penerimaan Ketentuan</h2>
            <p>Dengan mendaftar dan menggunakan MitBridge, Anda menyetujui syarat dan ketentuan ini. Harap baca dengan seksama sebelum menggunakan layanan kami.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold text-[#191B23] mb-2">2. Penggunaan Layanan</h2>
            <p>MitBridge adalah platform manajemen kelas untuk guru. Anda bertanggung jawab atas semua aktivitas yang terjadi di akun Anda dan wajib menjaga kerahasiaan kredensial login.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold text-[#191B23] mb-2">3. Akun Pengguna</h2>
            <p>Anda harus memberikan informasi yang akurat saat mendaftar. Satu akun hanya boleh digunakan oleh satu individu. Kami berhak menangguhkan akun yang melanggar ketentuan ini.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold text-[#191B23] mb-2">4. Konten dan Data</h2>
            <p>Anda memiliki hak atas konten yang Anda unggah. Dengan menggunakan layanan ini, Anda memberikan izin kepada MitBridge untuk menyimpan dan memproses data tersebut guna menjalankan layanan.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold text-[#191B23] mb-2">5. Perubahan Ketentuan</h2>
            <p>Kami dapat memperbarui syarat ini sewaktu-waktu. Perubahan signifikan akan diberitahukan melalui email atau notifikasi di platform.</p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-[#C3C6D7]">
          <a href="/guru/register" className="text-[#004AC6] text-[14px] hover:underline">← Kembali ke Registrasi</a>
        </div>
      </div>
    </div>
  );
}