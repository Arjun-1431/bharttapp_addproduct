import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/db';
import cloudinary from '@/app/lib/cloudinary';

// Utility: Simple validation
function isValidPhone(phone) {
  return /^\d{10}$/.test(phone);
}

export async function POST(request) {
  try {
    const formData = await request.formData();

    const name = formData.get('name');
    const phone = formData.get('phone');
    const standee_type = formData.get('standee_type');
    const icons_selected_raw = formData.get('icons_selected');
    const icons_selected = icons_selected_raw?.split(',') || [];
    const other_icons = formData.get('other_icons');
    const logo = formData.get('logo');
    const upiQR = formData.get('upi_qr');

    // ✅ Server-side validation
    if (!name || !phone || !standee_type || !logo) {
      return NextResponse.json(
        { success: false, message: 'Name, Phone, Standee type and Logo are required.' },
        { status: 400 }
      );
    }

    if (!isValidPhone(phone)) {
      return NextResponse.json(
        { success: false, message: 'Phone number must be 10 digits.' },
        { status: 400 }
      );
    }

    // ✅ Upload Logo
    let logoUrl;
    try {
      const buffer = Buffer.from(await logo.arrayBuffer());
      const base64 = `data:${logo.type};base64,${buffer.toString('base64')}`;

      const upload = await cloudinary.uploader.upload(base64, {
        folder: 'standee_app',
      });

      logoUrl = upload.secure_url;
    } catch (err) {
      console.error('[Cloudinary Logo Upload Error]', err);
      return NextResponse.json(
        { success: false, message: 'Logo upload failed' },
        { status: 500 }
      );
    }

    // ✅ Upload optional UPI QR
    let upiQRUrl = null;
    if (upiQR && upiQR.name) {
      try {
        const qrBuffer = Buffer.from(await upiQR.arrayBuffer());
        const qrBase64 = `data:${upiQR.type};base64,${qrBuffer.toString('base64')}`;

        const qrUpload = await cloudinary.uploader.upload(qrBase64, {
          folder: 'standee_app/upi_qr',
        });

        upiQRUrl = qrUpload.secure_url;
      } catch (err) {
        console.error('[UPI QR Upload Error]', err);
        return NextResponse.json(
          { success: false, message: 'UPI QR upload failed' },
          { status: 500 }
        );
      }
    }

    // ✅ Store in DB
    try {
      const client = await clientPromise;
      const db = client.db('bharattapp');
      const orders = db.collection('standee_orders');

      const insert = await orders.insertOne({
        name,
        phone,
        standee_type,
        icons_selected,
        other_icons,
        logo_url: logoUrl,
        upi_qr_url: upiQRUrl,
        created_at: new Date(),
      });

      console.log('[Order Saved]', insert.insertedId);
    } catch (err) {
      console.error('[DB Insert Error]', err);
      return NextResponse.json(
        { success: false, message: 'Database insert failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Order submitted successfully' });
  } catch (err) {
    console.error('[POST Error]', err.stack || err);
    return NextResponse.json(
      { success: false, message: 'Unexpected error occurred', error: err.message },
      { status: 500 }
    );
  }
}
