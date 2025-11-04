// /js/uiHandler.js
// Modul ini menangani manipulasi tampilan (DOM) dan fungsi pembantu terkait UI
import { editNilai, hapusData } from './dataService.js'; 

// FUNGSI PEMBANTU: Untuk mendapatkan Nama Mata Kuliah
export const getNamaMataKuliah = (kode) => {
    switch (kode) {
        case 'MK001': return 'Kalkulus I';
        case 'MK002': return 'Fisika Dasar';
        case 'MK003': return 'Algoritma & Pemrograman';
        case 'MK004': return 'Bahasa Indonesia';
        default: return 'Kode Tidak Dikenal';
    }
};

// FUNGSI PEMBANTU: Untuk menghasilkan HTML <select> Mata Kuliah (digunakan untuk Edit)
export const generateMataKuliahSelect = (currentKode) => {
    const options = [
        { kode: 'MK001', nama: 'Kalkulus I' }, 
        { kode: 'MK002', nama: 'Fisika Dasar' },
        { kode: 'MK003', nama: 'Algoritma & Pemrograman' },
        { kode: 'MK004', nama: 'Bahasa Indonesia' },
    ];
    
    // Gunakan class swal2-select bawaan SweetAlert2
    let selectHtml = `<select id="swal-input-mk" class="swal2-select" required>`;
    selectHtml += `<option value="">Pilih mata kuliah..</option>`;

    options.forEach(opt => {
        // Jika kode cocok, tambahkan atribut 'selected'
        const selected = opt.kode === currentKode ? 'selected' : ''; 
        selectHtml += `<option value="${opt.kode}" ${selected}>${opt.nama}</option>`;
    });

    selectHtml += `</select>`;
    return selectHtml;
};

// Fungsi pembantu untuk menampilkan data ke tabel HTML (dengan perataan dan tombol)
export const tampilkanDataTabel = (data, tabelBodyId) => {
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