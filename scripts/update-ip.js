const os = require('os');
const fs = require('fs');
const path = require('path');

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  
  // 1. Coba cari interface fisik yang umum dulu (Wi-Fi, Ethernet)
  const physicalKeywords = ['wi-fi', 'wifi', 'ethernet', 'wlan', 'lan', 'en0', 'eth0'];
  
  for (const keyword of physicalKeywords) {
    for (const name in interfaces) {
      if (
        name.toLowerCase().includes(keyword) && 
        !name.toLowerCase().includes('virtual') && 
        !name.toLowerCase().includes('vethernet') &&
        !name.toLowerCase().includes('host-only')
      ) {
        for (const iface of interfaces[name]) {
          if (iface.family === 'IPv4' && !iface.internal) {
            return iface.address;
          }
        }
      }
    }
  }
  
  // 2. Jika tidak ketemu, cari interface apapun yang bukan virtual/vEthernet/WSL
  for (const name in interfaces) {
    if (
      !name.toLowerCase().includes('virtual') && 
      !name.toLowerCase().includes('vethernet') && 
      !name.toLowerCase().includes('wsl') &&
      !name.toLowerCase().includes('host-only')
    ) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
  }
  
  // 3. Terakhir, fallback ke interface IPv4 pertama yang bukan internal
  for (const name in interfaces) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  
  return null;
}

const localIp = getLocalIp();

if (!localIp) {
  console.error('❌ Gagal mendeteksi IP Address lokal komputer Anda.');
  console.log('Silakan jalankan perintah "ipconfig" di terminal Windows untuk mencari IPv4 Address Anda secara manual.');
  process.exit(1);
}

console.log(`✅ IP Address lokal terdeteksi: ${localIp}`);

const envFilePath = path.join(__dirname, '..', '.env.local');
const newApiUrl = `http://${localIp}:3000/api`;

const envContent = `EXPO_PUBLIC_API_URL=${newApiUrl}\n`;

try {
  fs.writeFileSync(envFilePath, envContent, 'utf8');
  console.log(`✅ File .env.local berhasil diperbarui!`);
  console.log(`🔗 API URL diatur ke: ${newApiUrl}`);
  console.log(`\n💡 Pastikan HP dan Laptop Anda berada di satu jaringan Wi-Fi yang sama.`);
} catch (error) {
  console.error('❌ Gagal menulis ke file .env.local:', error.message);
  process.exit(1);
}
