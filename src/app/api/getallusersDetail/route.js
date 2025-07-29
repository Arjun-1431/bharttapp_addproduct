import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/db';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('bharattapp');
    const orders = await db
      .collection('standee_orders')
      .find({})
      .sort({ created_at: -1 })
      .toArray();

    // Format and sanitize if needed
    const formatted = orders.map((order) => ({
      name: order.name,
      phone: order.phone,
      standee_type: order.standee_type,
      icons_selected: order.icons_selected || [],
      other_icons: order.other_icons || '',
      logo_url: order.logo_url || null,
      upi_qr_url: order.upi_qr_url || null,
      created_at: order.created_at,
    }));

    return NextResponse.json(
      { success: true, data: formatted },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store', // 🧠 Ensure fresh fetch
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('[GET Error]', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
