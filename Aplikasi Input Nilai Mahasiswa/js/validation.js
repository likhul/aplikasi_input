// /js/validation.js

// Fungsi validasiInput() (SweetAlert2)
export const validasiInput = (nama, nim, mataKuliah, nilai) => {
    if (!nama || !nim || !mataKuliah || !nilai) {
        Swal.fire({ 
            icon: 'warning',
            title: 'Validasi Gagal',
            text: 'Semua field harus diisi!',
        });
        return false;
    }

    const nilaiAngka = parseFloat(nilai);
    if (isNaN(nilaiAngka) || nilaiAngka < 0 || nilaiAngka > 100) {
        Swal.fire({
            icon: 'error',
            title: 'Input Salah',
            text: 'Nilai harus berupa angka (0 - 100)!',
        });
        return false;
    }

    return true; 
};