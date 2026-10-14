const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      default: 'RS Industries',
    },
    aboutDescription: {
      type: String,
      default: 'Leading wholesale B2B marketplace for industrial supplies.',
    },
    email: {
      type: String,
      required: true,
      default: 'hello@rsindustries.com',
    },
    contactPhone: {
      type: String,
      required: true,
      default: '+91-80-XXXX-XXXX',
    },
    alternatePhone: {
      type: String,
      default: '',
    },
    contactPerson: {
      type: String,
      default: 'Business Development Team',
    },
    officeAddress: {
      streetAddress: {
        type: String,
        default: '',
      },
      city: {
        type: String,
        default: 'Bengaluru',
      },
      state: {
        type: String,
        default: 'Karnataka',
      },
      postalCode: {
        type: String,
        default: '560038',
      },
      country: {
        type: String,
        default: 'India',
      },
    },
    socialMedia: {
      website: {
        type: String,
        default: '',
      },
      facebook: {
        type: String,
        default: '',
      },
      instagram: {
        type: String,
        default: '',
      },
      twitter: {
        type: String,
        default: '',
      },
      linkedin: {
        type: String,
        default: '',
      },
      youtube: {
        type: String,
        default: '',
      },
      whatsapp: {
        type: String,
        default: '',
      },
    },
    businessHours: {
      monday: {
        open: { type: String, default: '09:00' },
        close: { type: String, default: '18:00' },
      },
      tuesday: {
        open: { type: String, default: '09:00' },
        close: { type: String, default: '18:00' },
      },
      wednesday: {
        open: { type: String, default: '09:00' },
        close: { type: String, default: '18:00' },
      },
      thursday: {
        open: { type: String, default: '09:00' },
        close: { type: String, default: '18:00' },
      },
      friday: {
        open: { type: String, default: '09:00' },
        close: { type: String, default: '18:00' },
      },
      saturday: {
        open: { type: String, default: '10:00' },
        close: { type: String, default: '17:00' },
      },
      sunday: {
        open: { type: String, default: '' },
        close: { type: String, default: '' },
      },
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', companySchema);
