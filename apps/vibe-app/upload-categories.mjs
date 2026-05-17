import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
  console.log('Connecting to Supabase:', SUPABASE_URL);

  // 1. Create storage bucket
  console.log('\nCreating storage bucket...');
  const { error: bucketError } = await supabase.storage.createBucket('categories', {
    public: true,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
  });

  if (bucketError && !bucketError.message.includes('already exists')) {
    console.error('Bucket error:', bucketError.message);
  } else {
    console.log('Bucket ready: categories');
  }

  // 2. Upload clothes image
  console.log('\nUploading clothes image...');
  const imagePath = resolve(__dirname, '../../attached_assets/file_00000000d82c71f49f8ccfa0f0c03ff5_1778592066292.png');
  const imageFile = readFileSync(imagePath);

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('categories')
    .upload('clothes.png', imageFile, {
      contentType: 'image/png',
      upsert: true,
    });

  if (uploadError) {
    console.error('Upload error:', uploadError.message);
    process.exit(1);
  }

  console.log('Image uploaded:', uploadData.path);

  // 3. Get public URL
  const { data: urlData } = supabase.storage.from('categories').getPublicUrl('clothes.png');
  const imageUrl = urlData.publicUrl;
  console.log('Public URL:', imageUrl);

  // 4. Insert category record
  console.log('\nInserting category record...');
  const { error: insertError } = await supabase.from('categories').upsert({
    name: 'ملابس',
    slug: 'clothes',
    image_url: imageUrl,
  }, { onConflict: 'slug' });

  if (insertError) {
    console.error('Insert error:', insertError.message);
    console.log('\nThe table does not exist yet. Please run this SQL in Supabase SQL Editor:');
    console.log(`
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
    `);
    process.exit(1);
  }

  console.log('\n✓ Done! Category "ملابس" saved successfully.');
  console.log('Image URL:', imageUrl);
}

run().catch(e => { console.error(e); process.exit(1); });
