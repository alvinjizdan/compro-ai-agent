export const getGeminiResponse = async (history: any[], message: string, webProducts: any[]) => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // KUNCI UTAMA: Kirim pesan DAN data produk asli dari website
      body: JSON.stringify({ 
        message: message, 
        products: webProducts 
      }) 
    });

    if (!response.ok) throw new Error("Gagal terhubung ke server backend");
    
    const data = await response.json();
    
    // PERUBAHAN: Kembalikan seluruh objek (data), BUKAN cuma data.reply
    // Agar komponen React bisa membaca data.reply dan data.productId
    return data; 

  } catch (error: any) {
    console.error("Error Chatbot Lokal:", error);
    
    // PERUBAHAN: Samakan format kembalian saat error agar aplikasi tidak crash
    return {
      reply: "Maaf, sistem layanan pelanggan sedang dalam perbaikan (Server Offline).",
      productIds: [],
      score: 0
    };
  }
};