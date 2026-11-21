'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { useGateDesk } from '@/context/GateDeskContext';
import { Download, Printer, X, Smartphone, ShieldCheck, ArrowRight } from 'lucide-react';

export const PrintablePosterModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { facility } = useGateDesk();
  const [qrDataUrl, setQrDataUrl] = useState('');

  const tenantAppUrl = `https://${facility.tenantAppSettings.subdomain}.gatedesk.app`;

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(
        tenantAppUrl,
        {
          width: 320,
          margin: 2,
          color: {
            dark: '#0A1628',
            light: '#FFFFFF',
          },
        },
        (err, url) => {
          if (!err && url) {
            setQrDataUrl(url);
          }
        }
      );
    }
  }, [isOpen, tenantAppUrl]);

  if (!isOpen) return null;

  const handleDownloadQr = () => {
    const link = document.createElement('a');
    link.download = `${facility.tenantAppSettings.subdomain}-qr-code.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-8 text-slate-900 border border-slate-200 animate-in fade-in zoom-in-95 my-8">
        {/* Controls header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Facility QR Poster &amp; Sign
            </h3>
            <p className="text-xs text-slate-500">
              Print and tape this near your gate keypad, office door, and elevators.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadQr}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PNG QR</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white rounded-lg shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Poster</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Sheet (8.5x11 vertical poster aspect) */}
        <div className="mt-6 border-4 border-slate-900 rounded-2xl p-8 text-center space-y-6 bg-slate-50 print:border-none print:p-0 print:m-0">
          {/* Facility Brand Lockup */}
          <div>
            <div className="inline-block px-3 py-1 bg-teal-600 text-white rounded-full text-xs font-extrabold uppercase tracking-widest mb-3">
              Official Tenant App
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 uppercase tracking-tight">
              {facility.name}
            </h2>
            <p className="text-sm font-semibold text-slate-600 mt-1">
              Gate Access · Fast Help Requests · Rent Payments · Refer Friends
            </p>
          </div>

          {/* Big QR Code */}
          <div className="bg-white p-6 rounded-2xl border-2 border-slate-900 shadow-md inline-block mx-auto">
            {qrDataUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={qrDataUrl}
                alt="Scan to open tenant app"
                className="w-56 h-56 mx-auto object-contain"
              />
            ) : (
              <div className="w-56 h-56 bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                Generating QR code...
              </div>
            )}
            <div className="mt-3 font-mono font-bold text-xs text-slate-800">
              {tenantAppUrl}
            </div>
          </div>

          {/* Simple 3 Step Instructions */}
          <div className="grid grid-cols-3 gap-3 text-left max-w-md mx-auto pt-2">
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="font-extrabold text-teal-600 text-sm block">01.</span>
              <p className="text-[11px] font-bold text-slate-800 mt-0.5">Scan with Camera</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Point phone at QR code</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="font-extrabold text-teal-600 text-sm block">02.</span>
              <p className="text-[11px] font-bold text-slate-800 mt-0.5">Add to Home</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Tap &quot;Add to Home Screen&quot;</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="font-extrabold text-teal-600 text-sm block">03.</span>
              <p className="text-[11px] font-bold text-slate-800 mt-0.5">Instant Help</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Report gate issues 24/7</p>
            </div>
          </div>

          {/* Footer Contact */}
          <div className="pt-4 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span>Office: {facility.phone}</span>
            <span>Gate Hours: {facility.gateHours}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
