import { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from 'cloudinary';
import formidable from 'formidable';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Disable the default body parser for this route
export const config = {
  api: {
    bodyParser: false,
  },
};

const handleUpload = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      error: `Method ${req.method} Not Allowed`,
    });
  }

  try {
    const file = await new Promise<formidable.File>((resolve, reject) => {
      const form = formidable({});
      form.parse(req, (err, fields, files) => {
        if (err) {
          return reject(err);
        }
        const file = Array.isArray(files.file) ? files.file[0] : files.file;
        if (!file) {
          return reject(new Error('No file uploaded.'));
        }
        resolve(file);
      });
    });

    const result = await cloudinary.uploader.upload(file.filepath, {
      // Folders can be used to organize assets in Cloudinary
      // folder: 'aiaa-uploads', 
      // You can also specify allowed formats or other upload options here
      // allowed_formats: ['png', 'jpg', 'pdf', 'docx'],
    });

    return res.status(200).json({ url: result.secure_url });

  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return res.status(500).json({ error: `Failed to upload file. ${message}` });
  }
};

export default handleUpload;
