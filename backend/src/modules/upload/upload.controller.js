const { uploadBase64, uploadBuffer } = require('../../services/s3.service');

exports.uploadImage = async (req, res) => {
  try {
    const { image, base64, folder } = req.body;
    const target = image || base64;

    if (!target) {
      return res.status(400).json({ error: 'Please provide an image in base64 format.' });
    }

    const publicUrl = await uploadBase64(target, folder || 'products');
    return res.status(200).json({
      success: true,
      url: publicUrl,
      secure_url: publicUrl,
    });
  } catch (err) {
    console.error('[Upload Error]:', err);
    return res.status(500).json({ error: err.message || 'Image upload failed' });
  }
};

exports.uploadMultipleImages = async (req, res) => {
  try {
    const { images, folder } = req.body;
    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'Please provide an array of images in base64 format.' });
    }

    const uploadPromises = images.map((img) => uploadBase64(img, folder || 'products'));
    const urls = await Promise.all(uploadPromises);

    return res.status(200).json({
      success: true,
      urls,
    });
  } catch (err) {
    console.error('[Multiple Upload Error]:', err);
    return res.status(500).json({ error: err.message || 'Multiple upload failed' });
  }
};
