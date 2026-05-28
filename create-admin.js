// Script untuk membuat akun admin menggunakan Firebase REST API
const apiKey = "AIzaSyDfegc8Z59hdhWID27hDLSEMg8m3Mjv3s0";
const projectId = "myportofolio-a22bc";
const email = process.argv[2] || "admin@example.com";
const password = process.argv[3] || "admin123";

async function createAdmin() {
  try {
    console.log(`Membuat akun dengan email: ${email}...`);
    
    // 1. Buat User via Firebase Auth REST API
    const authRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true
      })
    });
    const authData = await authRes.json();
    
    if (authData.error) {
      if (authData.error.message === 'EMAIL_EXISTS') {
        console.log('✅ Email sudah terdaftar sebagai user.');
      } else {
        throw new Error(`Auth Error: ${authData.error.message}`);
      }
    } else {
      console.log('✅ Akun berhasil dibuat di Firebase Auth!');
    }
    
    // Sign in untuk mendapatkan localId Token jika user sudah ada (hanya untuk script ini)
    let uid = authData.localId;
    if (!uid) {
        const loginRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, returnSecureToken: true })
        });
        const loginData = await loginRes.json();
        uid = loginData.localId;
    }

    if (uid) {
        console.log(`\nLocal ID User: ${uid}`);
        console.log('Tugas Anda berikutnya adalah menambahkan document admin ke Firestore dengan UID tersebut, karena Firestore REST API butuh custom rules atau token khusus.');
    }
    
    console.log(`\nEmail: ${email}`);
    console.log(`Password: ${password}`);
    
  } catch (error) {
    console.error('Error membuat admin:', error.message);
  }
}

createAdmin();
