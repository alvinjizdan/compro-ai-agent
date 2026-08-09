const { GoogleGenerativeAI } = require('@google/generative-ai');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Inisialisasi Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 1. DEKLARASI TOOLS (Function Declarations)
const adminTools = {
    functionDeclarations: [
        {
            name: "updateProductStock",
            description: "Menambahkan atau mengurangi stok produk di database berdasarkan nama produk.",
            parameters: {
                type: "OBJECT",
                properties: {
                    productName: {
                        type: "STRING",
                        description: "Nama produk yang ingin diubah stoknya."
                    },
                    quantityToAdd: {
                        type: "STRING",
                        description: "Jumlah stok yang ditambahkan (gunakan angka negatif untuk mengurangi). Masukkan nominal bulat tanpa titik/koma."
                    }
                },
                required: ["productName", "quantityToAdd"]
            }
        },
        {
            name: "updateProductPrice",
            description: "Mengubah harga dari suatu produk di database.",
            parameters: {
                type: "OBJECT",
                properties: {
                    productName: {
                        type: "STRING",
                        description: "Nama produk yang ingin diubah harganya."
                    },
                    newPrice: {
                        type: "STRING",
                        description: "Harga baru produk. Hanya masukkan nominal angka bulat tanpa titik/koma (misal: 14000)."
                    }
                },
                required: ["productName", "newPrice"]
            }
        },
        {
            name: "updateProductName",
            description: "Mengubah nama produk menjadi nama yang baru.",
            parameters: {
                type: "OBJECT",
                properties: {
                    oldProductName: {
                        type: "STRING",
                        description: "Nama produk saat ini yang ada di database."
                    },
                    newProductName: {
                        type: "STRING",
                        description: "Nama produk yang baru."
                    }
                },
                required: ["oldProductName", "newProductName"]
            }
        },
        {
            name: "setProductStock",
            description: "Mengubah total stok produk menjadi nilai mutlak tertentu (bukan ditambah/dikurang, melainkan di set langsung ke angka ini).",
            parameters: {
                type: "OBJECT",
                properties: {
                    productName: {
                        type: "STRING",
                        description: "Nama produk yang ingin di-set stoknya."
                    },
                    newStock: {
                        type: "STRING",
                        description: "Jumlah stok akhir (mutlak) yang baru. Masukkan nominal angka tanpa titik/koma."
                    }
                },
                required: ["productName", "newStock"]
            }
        },
        {
            name: "updateOrderStatus",
            description: "Mengubah status dari sebuah pesanan (order) berdasarkan ID pesanan.",
            parameters: {
                type: "OBJECT",
                properties: {
                    orderId: {
                        type: "STRING",
                        description: "ID Pesanan (Order ID) yang valid di database Mongoose."
                    },
                    newStatus: {
                        type: "STRING",
                        description: "Status pesanan terbaru. Nilai yang valid hanya: 'Menunggu Konfirmasi', 'Diproses', 'Dikirim', 'Selesai', 'Batal'."
                    }
                },
                required: ["orderId", "newStatus"]
            }
        },
        {
            name: "searchOrder",
            description: "Mencari data pesanan (order) di database berdasarkan kriteria tertentu (nama pelanggan, ID order, atau status).",
            parameters: {
                type: "OBJECT",
                properties: {
                    customerName: {
                        type: "STRING",
                        description: "Nama pelanggan atau bagian dari nama pelanggan."
                    },
                    orderId: {
                        type: "STRING",
                        description: "ID Pesanan MongoDB yang spesifik."
                    },
                    status: {
                        type: "STRING",
                        description: "Status spesifik pesanan (misal: 'Selesai', 'Batal', 'Diproses', 'Dikirim', 'Menunggu Konfirmasi')."
                    }
                }
            }
        }
    ]
};

// ==========================================
// 2. FUNGSI EKSEKUSI DATABASE
// ==========================================
const escapeRegex = (text) => String(text || '').replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

async function executeUpdateProductStock(args) {
    try {
        const rawStock = String(args.quantityToAdd || '').replace(/[^0-9-]/g, '');
        const stockNum = parseInt(rawStock, 10) || 0;
        const safeName = escapeRegex(args.productName);

        // Gunakan Regex agar pencarian nama produk lebih fleksibel (case-insensitive)
        const product = await Product.findOneAndUpdate(
            { name: new RegExp(safeName, 'i') },
            { $inc: { stock: stockNum } },
            { new: true, runValidators: true } // Return dokumen setelah di-update
        );

        if (!product) {
            return { error: `Produk dengan nama '${args.productName}' tidak ditemukan di database.` };
        }
        return {
            success: true,
            message: `Stok produk '${product.name}' berhasil diperbarui.`,
            newStock: product.stock
        };
    } catch (error) {
        return { error: `Gagal memperbarui stok: ${error.message}` };
    }
}

async function executeUpdateProductPrice(args) {
    try {
        // Parse harga secara manual untuk menghindari error jika AI mengirimkan string atau ada titik
        const rawPrice = args.newPrice.toString().replace(/[^0-9]/g, '');
        const priceNum = parseInt(rawPrice, 10);

        if (isNaN(priceNum)) {
            return { error: `Harga '${args.newPrice}' tidak valid. Harus berupa angka.` };
        }

        const safeName = escapeRegex(args.productName);

        const product = await Product.findOneAndUpdate(
            { name: new RegExp(safeName, 'i') },
            { price: priceNum },
            { new: true, runValidators: true }
        );

        if (!product) {
            return { error: `Produk dengan nama '${args.productName}' tidak ditemukan di database.` };
        }
        return {
            success: true,
            message: `Harga produk '${product.name}' berhasil diubah.`,
            newPrice: product.price
        };
    } catch (error) {
        return { error: `Gagal memperbarui harga: ${error.message}` };
    }
}

async function executeUpdateProductName(args) {
    try {
        const safeOldName = escapeRegex(args.oldProductName);
        const safeNewName = String(args.newProductName || '').trim();

        const product = await Product.findOneAndUpdate(
            { name: new RegExp(safeOldName, 'i') },
            { name: safeNewName },
            { new: true, runValidators: true }
        );

        if (!product) {
            return { error: `Produk dengan nama '${args.oldProductName}' tidak ditemukan di database.` };
        }
        return {
            success: true,
            message: `Nama produk berhasil diubah menjadi '${product.name}'.`
        };
    } catch (error) {
        return { error: `Gagal mengubah nama produk: ${error.message}` };
    }
}

async function executeSetProductStock(args) {
    try {
        const rawStock = String(args.newStock || '').replace(/[^0-9]/g, '');
        const stockNum = parseInt(rawStock, 10) || 0;
        const safeName = escapeRegex(args.productName);

        const product = await Product.findOneAndUpdate(
            { name: new RegExp(safeName, 'i') },
            { stock: stockNum },
            { new: true, runValidators: true }
        );

        if (!product) {
            return { error: `Produk dengan nama '${args.productName}' tidak ditemukan di database.` };
        }
        return {
            success: true,
            message: `Stok produk '${product.name}' berhasil di-set menjadi mutlak ${product.stock}.`,
            newStock: product.stock
        };
    } catch (error) {
        return { error: `Gagal men-set stok: ${error.message}` };
    }
}

async function executeUpdateOrderStatus(args) {
    try {
        const { Types } = require('mongoose');
        const orderId = String(args.orderId || '').trim();

        if (!Types.ObjectId.isValid(orderId)) {
            return { error: `ID Pesanan '${orderId}' tidak valid.` };
        }

        const validStatuses = ['Menunggu Konfirmasi', 'Diproses', 'Dikirim', 'Selesai', 'Batal'];
        const newStatus = String(args.newStatus || '').trim();
        const matchedStatus = validStatuses.find(s => s.toLowerCase() === newStatus.toLowerCase());

        if (!matchedStatus) {
            return { error: `Status '${newStatus}' tidak valid. Harus salah satu dari: ${validStatuses.join(', ')}.` };
        }

        const order = await Order.findByIdAndUpdate(
            orderId,
            { status: matchedStatus },
            { new: true, runValidators: true }
        );

        if (!order) {
            return { error: `Pesanan dengan ID '${args.orderId}' tidak ditemukan.` };
        }
        return {
            success: true,
            message: `Status pesanan ${args.orderId} berhasil diubah menjadi '${order.status}'.`
        };
    } catch (error) {
        return { error: `Gagal memperbarui status pesanan: Mungkinkah ID salah format? (${error.message})` };
    }
}

async function executeSearchOrder(args) {
    try {
        const query = {};

        if (args.customerName && typeof args.customerName === 'string') {
            const sanitizedName = args.customerName.trim().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
            query.customerName = new RegExp(sanitizedName, 'i');
        }

        if (args.orderId && typeof args.orderId === 'string') {
            const sanitizedId = args.orderId.trim();
            const { Types } = require('mongoose');
            if (Types.ObjectId.isValid(sanitizedId)) {
                query._id = sanitizedId;
            } else {
                return { success: true, message: `ID pesanan '${sanitizedId}' bukan format yang valid. Pencarian dibatalkan.`, data: [] };
            }
        }

        if (args.status && typeof args.status === 'string') {
            const validStatuses = ['Menunggu Konfirmasi', 'Diproses', 'Dikirim', 'Selesai', 'Batal'];
            const capStatus = args.status.trim();
            const matchedStatus = validStatuses.find(s => s.toLowerCase() === capStatus.toLowerCase());
            if (matchedStatus) {
                query.status = matchedStatus;
            } else {
                return { success: true, message: `Status '${capStatus}' tidak dikenal. Pencarian dibatalkan.`, data: [] };
            }
        }

        const orders = await Order.find(query)
            .select('_id customerName status totalPrice date items.name items.quantity')
            .sort({ date: -1 })
            .limit(5)
            .lean();

        if (!orders || orders.length === 0) {
            return { success: true, message: "Tidak ada pesanan yang cocok dengan kriteria.", data: [] };
        }

        const formattedOrders = orders.map(o => ({
            orderId: o._id.toString(),
            customerName: o.customerName,
            status: o.status,
            totalPrice: o.totalPrice,
            date: o.date ? new Date(o.date).toISOString() : null,
            items: o.items ? o.items.map(i => `${i.name} (x${i.quantity})`) : []
        }));

        return { success: true, message: `Ditemukan ${formattedOrders.length} pesanan.`, data: formattedOrders };
    } catch (error) {
        return { error: `Gagal mencari pesanan: ${error.message}` };
    }
}

// ==========================================
// 3. FUNGSI UTAMA (ENDPOINT CONTROLLER)
// ==========================================
const processAdminChat = async (req, res) => {
    try {
        const { history } = req.body;
        const message = String(req.body.message || '').trim();
        if (!message) return res.status(400).json({ error: "Pesan tidak boleh kosong." });
        if (message.length > 500) return res.status(400).json({ error: "Pesan terlalu panjang (maksimal 500 karakter)." });

        console.log(`\n[ADMIN AGENT] Pesan masuk: "${message}"`);

        const systemInstruction = `Kamu adalah AI Asisten Admin operasional toko. Tugasmu adalah membantu admin mengelola database toko (seperti mengubah stok barang, status pesanan, dan mencari data pesanan).

PENTING:
- Panggil tools 'searchOrder' jika admin meminta informasi pesanan pelanggan (seperti status order Budi, pesanan terbaru, dll).
- Jika hasil pencarian dari tools tidak ada, beritahu admin bahwa pesanan tidak ditemukan dengan ramah.
- Panggil tools 'updateOrderStatus' HANYA JIKA admin secara eksplisit meminta perubahan status dan kamu sudah mengetahui ID Pesanan (Order ID) yang valid. Jika admin meminta mengubah pesanan tanpa memberikan ID yang valid, cari pesanannya terlebih dahulu menggunakan 'searchOrder'.`;

        // Inisialisasi Model Gemini dengan konfigurasi Tools
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            tools: [adminTools],
            systemInstruction: systemInstruction
        });

        // Format history dari frontend ke format Gemini SDK
        let formattedHistory = [];
        if (history && Array.isArray(history)) {
            // Skip pesan pertama jika itu pesan default (Halo Admin...)
            const chatHistory = history.length > 0 && history[0].role === 'model' && history[0].parts.includes('Halo Admin')
                ? history.slice(1)
                : history;

            formattedHistory = chatHistory.map(h => ({
                role: h.role,
                parts: [{ text: h.parts }]
            }));
        }

        // Buat Chat Session dengan History
        const chat = model.startChat({ history: formattedHistory });

        // 1. Kirim pesan ke Gemini
        let result = await chat.sendMessage(message);
        let response = result.response;

        // 2. Cek apakah Gemini memutuskan untuk memanggil fungsi (Function Call)
        const functionCalls = response.functionCalls();
        let dbUpdated = false;

        if (functionCalls && functionCalls.length > 0) {
            const call = functionCalls[0]; // Ambil call pertama
            console.log(`[ADMIN AGENT] Model memanggil fungsi: ${call.name} dengan args:`, call.args);

            let dbResult = null;

            // 3. Eksekusi fungsi Mongoose native
            if (call.name === 'updateProductStock') {
                dbResult = await executeUpdateProductStock(call.args);
            } else if (call.name === 'updateProductPrice') {
                dbResult = await executeUpdateProductPrice(call.args);
            } else if (call.name === 'updateProductName') {
                dbResult = await executeUpdateProductName(call.args);
            } else if (call.name === 'setProductStock') {
                dbResult = await executeSetProductStock(call.args);
            } else if (call.name === 'updateOrderStatus') {
                dbResult = await executeUpdateOrderStatus(call.args);
            } else if (call.name === 'searchOrder') {
                dbResult = await executeSearchOrder(call.args);
            }

            console.log(`[ADMIN AGENT] Hasil eksekusi database:`, dbResult);

            if (dbResult && dbResult.success) {
                dbUpdated = true;
            }

            // 4. Kembalikan hasil eksekusi ke model Gemini (Function Response)
            result = await chat.sendMessage([{
                functionResponse: {
                    name: call.name,
                    response: dbResult
                }
            }]);

            // Dapatkan kalimat natural dari Gemini setelah diberikan hasil eksekusi
            response = result.response;
        }

        // 5. Kembalikan balasan natural ke Frontend
        const finalReply = response.text();
        console.log(`[ADMIN AGENT] Balasan ke Admin: "${finalReply}"\n`);

        return res.status(200).json({ reply: finalReply, dbUpdated });

    } catch (error) {
        console.error("Error di Admin Chat:", error);
        return res.status(500).json({
            reply: "Terjadi kesalahan internal server saat memproses permintaan admin agen."
        });
    }
};

module.exports = { processAdminChat };
