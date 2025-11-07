import { db } from "../../dbServer";

const RECEIPT_BUCKET = "payment-receipts"; // Create this bucket in Supabase Storage

// Upload receipt file
export async function uploadReceiptFile(paymentId, file, uploadedBy = null) {
  if (!paymentId) throw new Error("Payment ID is required");
  if (!file) throw new Error("File is required");
  
  // Validate file type
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Only PDF and image files (JPEG, PNG, WebP) are allowed");
  }
  
  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error("File size must be less than 10MB");
  }
  
  try {
    // Generate unique file name
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = `payment_${paymentId}_${timestamp}.${fileExt}`;
    const filePath = `receipts/${fileName}`;
    
    // Upload to Supabase Storage using db.storage
    const { data: uploadData, error: uploadError } = await db.storage
      .from(RECEIPT_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) throw uploadError;
    
    // Get public URL
    const { data: urlData } = db.storage
      .from(RECEIPT_BUCKET)
      .getPublicUrl(filePath);
    
    // Save receipt record to database
    const { data, error } = await db
      .from("payment_receipts")
      .insert({
        payment_id: paymentId,
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: uploadedBy
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Error uploading receipt:", err);
    throw err;
  }
}

// Fetch all receipts for a payment
export async function fetchPaymentReceipts(paymentId) {
  if (!paymentId) throw new Error("Payment ID is required");
  
  const { data, error } = await db
    .from("payment_receipts")
    .select("*")
    .eq("payment_id", paymentId)
    .order("created_at", { ascending: false });
  
  if (error) throw error;
  return data || [];
}

// Delete receipt
export async function deleteReceipt(receiptId) {
  if (!receiptId) throw new Error("Receipt ID is required");
  
  try {
    // Get receipt details first
    const { data: receipt, error: fetchError } = await db
      .from("payment_receipts")
      .select("file_url")
      .eq("id", receiptId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Extract file path from URL
    const url = new URL(receipt.file_url);
    const filePath = url.pathname.split(`/${RECEIPT_BUCKET}/`)[1];
    
    // Delete from storage using db.storage
    const { error: storageError } = await db.storage
      .from(RECEIPT_BUCKET)
      .remove([filePath]);
    
    if (storageError) console.warn("Storage deletion warning:", storageError);
    
    // Delete from database
    const { error } = await db
      .from("payment_receipts")
      .delete()
      .eq("id", receiptId);
    
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Error deleting receipt:", err);
    throw err;
  }
}