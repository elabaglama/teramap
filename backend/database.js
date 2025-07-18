const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Veritabanı dosyası
const dbPath = path.join(__dirname, 'data', 'teramap.db');

// Veritabanı bağlantısı
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Veritabanı bağlantı hatası:', err.message);
    } else {
        console.log('SQLite veritabanına bağlanıldı');
        initializeTables();
    }
});

// Tabloları oluştur
function initializeTables() {
    // Rezervasyonlar tablosu
    db.run(`
        CREATE TABLE IF NOT EXISTS reservations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            venue TEXT NOT NULL,
            date TEXT NOT NULL,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Rezervasyon tablosu oluşturma hatası:', err.message);
        } else {
            console.log('Rezervasyon tablosu hazır');
        }
    });

    // E-posta logları tablosu
    db.run(`
        CREATE TABLE IF NOT EXISTS email_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            reservation_id INTEGER,
            recipient EMAIL NOT NULL,
            subject TEXT NOT NULL,
            type TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (reservation_id) REFERENCES reservations (id)
        )
    `, (err) => {
        if (err) {
            console.error('E-posta log tablosu oluşturma hatası:', err.message);
        } else {
            console.log('E-posta log tablosu hazır');
        }
    });
}

// Rezervasyon kaydet
function createReservation(reservationData) {
    return new Promise((resolve, reject) => {
        const { venue, date, name, email, phone } = reservationData;
        const sql = `
            INSERT INTO reservations (venue, date, name, email, phone)
            VALUES (?, ?, ?, ?, ?)
        `;
        
        db.run(sql, [venue, date, name, email, phone], function(err) {
            if (err) {
                reject(err);
            } else {
                // Oluşturulan rezervasyonu geri getir
                db.get('SELECT * FROM reservations WHERE id = ?', [this.lastID], (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                });
            }
        });
    });
}

// Tüm rezervasyonları getir
function getAllReservations() {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM reservations ORDER BY created_at DESC', (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

// Rezervasyon durumunu güncelle
function updateReservationStatus(id, status) {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE reservations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
        db.run(sql, [status, id], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes);
            }
        });
    });
}

// E-posta logu kaydet
function logEmail(reservationId, recipient, subject, type, status = 'sent') {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO email_logs (reservation_id, recipient, subject, type, status)
            VALUES (?, ?, ?, ?, ?)
        `;
        
        db.run(sql, [reservationId, recipient, subject, type, status], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
}

// Google Sheets'ten mekanın boş günlerini çek
const { google } = require('googleapis');
const sheets = google.sheets('v4');
const sheetsAuth = new google.auth.GoogleAuth({
  keyFile: __dirname + '/service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

async function getAvailableDates(venue) {
  const client = await sheetsAuth.getClient();
  const spreadsheetId = '1P6Fn6cm7XCHtPpWCs2ea0SXnnlq_5khV1GP9pZSyPqs';
  const range = 'Sayfa1!A2:B'; // Başlık hariç

  const res = await sheets.spreadsheets.values.get({
    auth: client,
    spreadsheetId,
    range,
  });

  const rows = res.data.values;
  if (!rows || !rows.length) return [];
  // Sadece ilgili mekanın günlerini döndür
  return rows.filter(row => row[0] === venue).map(row => row[1]);
}

module.exports = {
    db,
    createReservation,
    getAllReservations,
    updateReservationStatus,
    logEmail,
    getAvailableDates
}; 