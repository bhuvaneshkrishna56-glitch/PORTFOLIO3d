import { useState, useEffect, useCallback } from 'react';
import { fetchCertificates } from '../services/certificateService';
import CertificateForm from '../components/CertificateForm';
import CertificateList from '../components/CertificateList';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AdminCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchList = useCallback(async () => {
    setLoading(true);
    const result = await fetchCertificates();
    if (!result.error) {
      setCertificates(result.certificates);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-glass-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Manage Certificates</h1>
          <p className="text-text-secondary text-sm mt-1">Upload and manage your professional credentials and certifications.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form to upload certificate */}
        <div className="lg:col-span-1">
          <CertificateForm onCertificateAdded={fetchList} />
        </div>

        {/* List of existing certificates */}
        <div className="lg:col-span-2">
          {loading ? (
            <LoadingSpinner message="Refreshing certificates..." />
          ) : (
            <CertificateList certificates={certificates} onCertificateDeleted={fetchList} />
          )}
        </div>
      </div>
    </div>
  );
}
