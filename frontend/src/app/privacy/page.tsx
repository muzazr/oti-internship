export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FAF8FF] py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-[12px] border border-[#C3C6D7] p-8 shadow-sm">
        <h1 className="text-[28px] font-bold text-[#191B23] mb-2">Kebijakan Privasi</h1>
        <p className="text-[13px] text-[#737686] mb-8">Terakhir diperbarui: Mei 2025</p>

        <div className="flex flex-col gap-6 text-[14px] text-[#434655] leading-relaxed">
          <section>
            <h2 className="text-[16px] font-bold text-[#191B23] mb-2">1. Data yang Kami Kumpulkan</h2>
            <p>Kami mengumpulkan informasi yang Anda berikan saat mendaftar seperti nama lengkap, alamat email, dan data aktivitas penggunaan platform.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold text-[#191B23] mb-2">2. Penggunaan Data</h2>
            <p>Data Anda digunakan untuk menjalankan layanan, meningkatkan pengalaman pengguna, dan mengirimkan notifikasi penting terkait akun Anda.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold text-[#191B23] mb-2">3. Keamanan Data</h2>
            <p>Kami menggunakan enkripsi dan langkah keamanan industri standar untuk melindungi data Anda. Namun, tidak ada sistem yang 100% aman — harap gunakan password yang kuat.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold text-[#191B23] mb-2">4. Berbagi Data</h2>
            <p>Kami tidak menjual atau menyewakan data pribadi Anda kepada pihak ketiga. Data hanya dibagikan jika diwajibkan oleh hukum atau untuk menjalankan layanan inti platform.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold text-[#191B23] mb-2">5. Hak Pengguna</h2>
            <p>Anda berhak mengakses, memperbarui, atau menghapus data pribadi Anda. Hubungi kami melalui email untuk mengajukan permintaan tersebut.</p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-[#C3C6D7]">
          <a href="/guru/register" className="text-[#004AC6] text-[14px] hover:underline">← Kembali ke Registrasi</a>
        </div>
      </div>
    </div>
  );
}