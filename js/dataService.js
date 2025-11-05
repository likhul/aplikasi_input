// /js/dataService.js
// Modul ini menangani semua operasi CRUD (Create, Read, Update, Delete) ke Firestore
import { db } from "./firebaseConfig.js"; 
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getNamaMataKuliah, tampilkanDataTabel, generateMataKuliahSelect } from './uiHandler.js'; 

/**
 * Menyimpan data nilai baru ke Firestore.
 * @param {object} data - Objek data nilai mahasiswa.
 */
export const simpanData = async (data) => {
    try {
        await addDoc(collection(db, "Nilai"), {
            nama: data.nama,
            nim: data.nim,
            kode_mk: data.kode_mk,
            nilai: data.nilaiAngka
        });

        const mataKuliahNama = getNamaMataKuliah(data.kode_mk);
        
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Data berhasil disimpan!',
            html: `
                <div style="text-align: left; padding: 10px; font-size: 0.9rem;">
                    <p style="margin-bottom: 5px;"><strong>Nama:</strong> ${data.nama}</p>
                    <p style="margin-bottom: 5px;"><strong>Mata Kuliah:</strong> ${data.kode_mk} - ${mataKuliahNama}</p>
                    <p style="margin-bottom: 0;"><strong>Nilai:</strong> ${data.nilaiAngka}</p>
                </div>
            `,
            showConfirmButton: false,
            timer: 3500,
            timerProgressBar: true
        });
        return true;
    } catch (e) {
        console.error("Error adding document: ", e);
        Swal.fire({
            icon: 'error',
            title: 'Gagal Menyimpan',
            text: 'Terjadi kesalahan saat menyimpan data. Cek koneksi Anda!',
        });
        return false;
    }
};

/**
 * Memuat semua data nilai dari Firestore dan menampilkannya ke tabel.
 * @param {string} tabelBodyId - ID dari tbody tabel di lihatdatamhs.html.
 */
export const loadData = async (tabelBodyId) => {
    const dataNilai = [];
    
    Swal.fire({
        title: 'Memuat Data...',
        text: 'Sedang mengambil data nilai mahasiswa dari server.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        const querySnapshot = await getDocs(collection(db, "Nilai"));

        querySnapshot.forEach((doc) => {
            dataNilai.push({ id: doc.id, ...doc.data() }); 
        });
        
        Swal.close();

        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'info',
            title: `Memuat ${dataNilai.length} data nilai berhasil.`,
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
        });

        tampilkanDataTabel(dataNilai, tabelBodyId); 
        return dataNilai;

    } catch (e) {
        console.error("Error loading documents: ", e);
        Swal.fire({
            icon: 'error',
            title: 'Gagal Memuat Data',
            text: 'Terjadi kesalahan saat memuat data nilai.',
        });
        Swal.close();
        return [];
    }
};

/**
 * Menampilkan SweetAlert2 form untuk mengedit data nilai dan menyimpannya.
 * @param {string} docId - ID dokumen Firestore.
 * @param {object} itemData - Objek data dokumen.
 */
export const editNilai = async (docId, itemData) => { 
    
    const mkSelectHtml = generateMataKuliahSelect(itemData.kode_mk); 

    const result = await Swal.fire({
        title: `Edit Data: ${itemData.nama}`,
        html: `
            <div style="text-align: left; margin-bottom: 20px;">
                <div style="display: flex; gap: 15px; margin-bottom: 10px;">
                    <div style="flex: 1;">
                        <label for="swal-input-nama" class="swal2-label" style="text-align: left; display: block; font-weight: 600;">Nama Lengkap:</label>
                        <input id="swal-input-nama" class="swal2-input" value="${itemData.nama}" style="width: 100%; margin: 0;">
                    </div>

                    <div style="flex: 1;">
                        <label for="swal-input-nim" class="swal2-label" style="text-align: left; display: block; font-weight: 600;">NIM:</label>
                        <input id="swal-input-nim" class="swal2-input" value="${itemData.nim}" style="width: 100%; margin: 0;">
                    </div>
                </div>

                <label for="swal-input-mk" class="swal2-label" style="text-align: left; display: block; margin-top: 15px; font-weight: 600;">Mata Kuliah:</label>
                ${mkSelectHtml.replace(
                    `<select id="swal-input-mk" class="swal2-select" required>`, 
                    `<select id="swal-input-mk" class="swal2-select" required style="width: 100%; margin: 0 0 10px 0;">`
                )}

                <label for="swal-input-nilai" class="swal2-label" style="text-align: left; display: block; font-weight: 600;">Nilai (0-100):</label>
                <input id="swal-input-nilai" class="swal2-input" type="number" step="0.1" value="${itemData.nilai}" style="width: 100%; margin: 0;">
            </div>
        `,
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Simpan Perubahan',
        cancelButtonText: 'Batal',
        focusConfirm: false,
        preConfirm: () => {
            const nama = document.getElementById('swal-input-nama').value.trim();
            const nim = document.getElementById('swal-input-nim').value.trim();
            const kode_mk = document.getElementById('swal-input-mk').value;
            const nilaiBaru = document.getElementById('swal-input-nilai').value.trim();
            
            const nilaiAngka = parseFloat(nilaiBaru);

            if (!nama || !nim || !kode_mk || !nilaiBaru) {
                Swal.showValidationMessage('Semua field harus diisi!');
                return false;
            }
            if (isNaN(nilaiAngka) || nilaiAngka < 0 || nilaiAngka > 100) {
                Swal.showValidationMessage('Nilai harus berupa angka antara 0 hingga 100!');
                return false;
            }
            
            return { nama, nim, kode_mk, nilai: nilaiAngka };
        }
    });

    if (result.isConfirmed) {
        const dataBaru = result.value;
        try {
            const docRef = doc(db, "Nilai", docId);
            await updateDoc(docRef, dataBaru);

            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Data berhasil diperbarui!',
                showConfirmButton: false,
                timer: 2000
            });
            
            loadData('dataNilaiBody'); 

        } catch (e) {
            console.error("Error updating document: ", e);
            Swal.fire({
                icon: 'error',
                title: 'Gagal Update',
                text: 'Terjadi kesalahan saat memperbarui data!',
            });
        }
    }
};

/**
 * Menghapus dokumen nilai dari Firestore setelah konfirmasi.
 * @param {string} docId - ID dokumen Firestore yang akan dihapus.
 */
export const hapusData = async (docId) => {
    const result = await Swal.fire({
        title: 'Anda Yakin?',
        text: "Data yang sudah dihapus tidak dapat dikembalikan!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Ya, Hapus Data!',
        cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
        try {
            await deleteDoc(doc(db, "Nilai", docId));

            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Data berhasil dihapus!',
                showConfirmButton: false,
                timer: 2000
            });
            
            loadData('dataNilaiBody'); 

        } catch (e) {
            console.error("Error deleting document: ", e);
            Swal.fire({
                icon: 'error',
                title: 'Gagal Hapus',
                text: 'Terjadi kesalahan saat menghapus data. Cek koneksi Anda!',
            });
        }
    }
};