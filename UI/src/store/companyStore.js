import { create } from 'zustand';
import { api } from '../services/api';

export const useCompanyStore = create((set, get) => ({
  company: null,
  loading: false,
  error: null,

  // Fetch company details from backend
  fetchCompanyDetails: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.getCompanyDetails();
      const companyData = data?.data || data;
      set({ company: companyData, loading: false });
      return companyData;
    } catch (err) {
      set({ loading: false, error: err.message });
      console.error('[CompanyStore] Error fetching company details:', err.message);
    }
  },

  // Get specific contact info
  getContactPhone: () => {
    const company = get().company;
    return company?.contactPhone || '+91-80-XXXX-XXXX';
  },

  getAlternatePhone: () => {
    const company = get().company;
    return company?.alternatePhone || '';
  },

  getWhatsAppNumber: () => {
    const company = get().company;
    return company?.socialMedia?.whatsapp || company?.contactPhone || '+91-80-XXXX-XXXX';
  },

  getEmail: () => {
    const company = get().company;
    return company?.email || 'hello@rsindustries.com';
  },

  getCompanyName: () => {
    const company = get().company;
    return company?.companyName || 'RS Industries';
  },

  getContactPerson: () => {
    const company = get().company;
    return company?.contactPerson || 'Support Team';
  },

  getOfficeAddress: () => {
    const company = get().company;
    if (!company?.officeAddress) return 'Bengaluru, India';
    const addr = company.officeAddress;
    return `${addr.streetAddress || ''}, ${addr.city || ''}, ${addr.state || ''} ${addr.postalCode || ''}`.replace(/^,\s*|,\s*$/g, '');
  },

  // Ensure company data is loaded
  ensureLoaded: async () => {
    const current = get().company;
    if (!current) {
      await get().fetchCompanyDetails();
    }
    return get().company;
  },
}));
