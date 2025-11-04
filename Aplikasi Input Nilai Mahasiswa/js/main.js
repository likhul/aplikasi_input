// /js/main.js
// Gabungan semua logika dari file logic.js, validation.js, uiHandler.js, dan dataService.js

// 1. IMPORT FIREBASE (Modul konfigurasi, CRUD, dll.)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Kredensial Firebase (dari firebaseConfig.js)
const firebaseConfig = {
    apiKey: "AIzaSyDM_9G09-2UkZnayStk62ILtvlLD2kdHBc",
    authDomain: "aplikasi-input-nilai-mah-17427.firebaseapp.com",
    projectId: "aplikasi-input-nilai-mah-17427",
    storageBucket: "aplikasi-input-nilai-mah-17427.firebasestorage.app",
    messagingSenderId: "465203677701",
    appId: "1:465203677701:web:661643994091af3551ea6c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// 2. FUNGSI PEMBANTU (Mata Kuliah & HTML Select)
const getNamaMataKuliah = (kode) => {
    switch (kode) {
        case 'MK001': return 'Kalkulus I';
        case 'MK002': return 'Fisika Dasar';
        case 'MK003': return 'Algoritma & Pemrograman';
        case 'MK004': return 'Bahasa Indonesia';
        default: return 'Kode Tidak Dikenal';
    }
};

const generateMataKuliahSelect = (currentKode) => {
    const options = [
        { kode: 'MK001', nama: 'Kalkulus I' }, 
        { kode: 'MK002', nama: 'Fisika Dasar' },
        { kode: 'MK003', nama: 'Algoritma & Pemrograman' },
        { kode: 'MK004', nama: 'Bahasa Indonesia' },
    ];
    
    let selectHtml = `<select id="swal-input-mk" class="swal2-select" required>`;
    selectHtml += `<option value="">Pilih mata kuliah..</option>`;

    options.forEach(opt => {
        const selected = opt.kode === currentKode ? 'selected' : ''; 
        selectHtml += `<option value="${opt.kode}" ${selected}>${opt.nama}</option>`;
    });

    selectHtml += `</select>`;
    return selectHtml;
};


// 3. FUNGSI VALIDASI (dari validation.js)
const validasiInput = (nama, nim, mataKuliah, nilai) => {
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


// 4. FUNGSI UTAMA CRUD (dari dataService.js)

// A. CREATE: Simpan Data Baru
const simpanData = async (data) => {
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

// B. READ: Memuat Data dari Firestore
const loadData = async (tabelBodyId) => {
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

        tampilkanDataTabel(dataNilai, tabelBodyId); // Panggil fungsi UI
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

// C. UPDATE: Edit Nilai (dengan SweetAlert2 Form)
const editNilai = async (docId, itemData) => { 
    
    const mkSelectHtml = generateMataKuliahSelect(itemData.kode_mk);

    const result = await Swal.fire({
        title: `Edit Data: ${itemData.nama}`,
        html: `
            <div style="text-align: left; margin-bottom: 20px;">
                <div style="display: flex; gap: 15px; margin-bottom: 10px;">
                    <div style="flex: 1;">
                        <label for="swal-input-nama" class="swal2-label" style="text-align: left; display: block; margin-bottom: 5px; font-weight: 600;">Nama Lengkap:</label>
                        <input id="swal-input-nama" class="swal2-input" value="${itemData.nama}" style="width: 100%; margin: 0;">
                    </div>

                    <div style="flex: 1;">
                        <label for="swal-input-nim" class="swal2-label" style="text-align: left; display: block; margin-bottom: 5px; font-weight: 600;">NIM:</label>
                        <input id="swal-input-nim" class="swal2-input" value="${itemData.nim}" style="width: 100%; margin: 0;">
                    </div>
                </div>

                <label for="swal-input-mk" class="swal2-label" style="text-align: left; display: block; margin-bottom: 5px; margin-top: 15px; font-weight: 600;">Mata Kuliah:</label>
                ${mkSelectHtml.replace(
                    `<select id="swal-input-mk" class="swal2-select" required>`, 
                    `<select id="swal-input-mk" class="swal2-select" required style="width: 100%; margin: 0 0 10px 0;">`
                )}

                <label for="swal-input-nilai" class="swal2-label" style="text-align: left; display: block; margin-bottom: 5px; font-weight: 600;">Nilai (0-100):</label>
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

// D. DELETE: Hapus Data
const hapusData = async (docId) => {
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


// 5. FUNGSI TAMPILAN TABEL (dari uiHandler.js)
const tampilkanDataTabel = (data, tabelBodyId) => {
    const tabelBody = document.getElementById(tabelBodyId);
    if (!tabelBody) return;

    tabelBody.innerHTML = ''; 

    if (data.length === 0) {
        const row = tabelBody.insertRow();
        const cell = row.insertCell(0);
        cell.colSpan = 6; 
        cell.className = 'text-center p-3';
        cell.textContent = 'Tidak ada data nilai yang tersimpan.';
        return;
    }

    data.forEach((item, index) => {
        const row = tabelBody.insertRow();
        
        // 1. No. (Rata Tengah)
        row.insertCell(0).textContent = index + 1;
        row.cells[0].className = 'text-center'; 

        // 2. Nama Lengkap (Rata Kiri - Default)
        row.insertCell(1).textContent = item.nama;
        
        // 3. NIM (Rata Tengah)
        row.insertCell(2).textContent = item.nim;
        row.cells[2].className = 'text-center'; 
        
        // 4. Mata Kuliah (Format Kode - Nama)
        const namaMK = getNamaMataKuliah(item.kode_mk);
        row.insertCell(3).textContent = `${item.kode_mk} - ${namaMK}`;
        
        // 5. Nilai (Rata Tengah)
        row.insertCell(4).textContent = item.nilai;
        row.cells[4].className = 'text-center'; 

        // 6. Aksi (Rata Tengah)
        const aksiCell = row.insertCell(5);
        aksiCell.className = 'text-center'; 

        // Tombol Edit
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.className = 'btn btn-aksi-edit'; 
        editBtn.setAttribute('data-id', item.id); 
        editBtn.addEventListener('click', () => {
            editNilai(item.id, item); 
        });
        
        // Tombol Hapus
        const hapusBtn = document.createElement('button');
        hapusBtn.textContent = 'Hapus';
        hapusBtn.className = 'btn btn-aksi-hapus'; 
        hapusBtn.setAttribute('data-id', item.id);
        hapusBtn.addEventListener('click', () => {
             hapusData(item.id); 
        });

        aksiCell.appendChild(editBtn);
        aksiCell.appendChild(hapusBtn);
    });
}


// 6. EVENT LISTENER UTAMA (Aksi di index.html dan lihatdatamhs.html)
document.addEventListener('DOMContentLoaded', () => {
    const simpanBtn = document.getElementById('simpanDataBtn');

    // Untuk halaman index.html
    if (simpanBtn) {
        simpanBtn.addEventListener('click', async (e) => {
            e.preventDefault(); 

            const nama = document.getElementById('namaLengkap').value.trim();
            const nim = document.getElementById('nim').value.trim();
            const mataKuliah = document.getElementById('mataKuliah').value; 
            const nilai = document.getElementById('nilaiMahasiswa').value.trim();

            if (validasiInput(nama, nim, mataKuliah, nilai)) { 
                const dataSimpan = {
                    nama,
                    nim,
                    kode_mk: mataKuliah,
                    nilaiAngka: parseFloat(nilai)
                };

                const berhasilSimpan = await simpanData(dataSimpan); 

                if (berhasilSimpan) {
                    document.getElementById('formInputNilai').reset();
                    // >>> BARIS BARU UNTUK PINDAH OTOMATIS <<<
                    window.location.href = 'lihatdatamhs.html'; 
                }
            }
        });
    }

    // Untuk halaman lihatdatamhs.html
    if (document.getElementById('dataNilaiBody')) {
        loadData('dataNilaiBody');
    }
});