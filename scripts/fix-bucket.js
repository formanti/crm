/* eslint-disable @typescript-eslint/no-require-imports */
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://wlvkqndkdlxdwgtydidl.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsdmtxbmRrZGx4ZHdndHlkaWRsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzc1NTg5MCwiZXhwIjoyMDgzMzMxODkwfQ.raVtZz4I96xIbZ-4yoOguu5P-IlcGleuwQkDTeJGLyU'
);

async function fixBucketPolicy() {
    // Delete the bucket first
    const deleteResult = await supabase.storage.deleteBucket('cvs');
    console.log('Delete result:', deleteResult.error ? deleteResult.error.message : 'Deleted');

    // Recreate with public access
    const createResult = await supabase.storage.createBucket('cvs', {
        public: true,
        fileSizeLimit: 10485760,
        allowedMimeTypes: ['application/pdf']
    });

    if (createResult.error) {
        console.log('Create error:', createResult.error.message);
    } else {
        console.log('Bucket cvs recreado con acceso publico');
    }
}

fixBucketPolicy();
