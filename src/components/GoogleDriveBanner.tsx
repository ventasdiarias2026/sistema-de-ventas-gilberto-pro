import React, { useRef } from 'react';
import {
  ExternalLink,
  DownloadCloud,
  UploadCloud,
  FolderOpen,
  FileSpreadsheet,
  FileJson,
} from 'lucide-react';
import {
  GOOGLE_DRIVE_FOLDER_URL,
  GOOGLE_DRIVE_FOLDER_ID,
  downloadDatabaseJson,
  downloadDatabaseCsv,
  readDatabaseJsonFile,
} from '../utils/driveService';
import { Sale, User } from '../types/telecom';

interface GoogleDriveBannerProps {
  users: User[];
  sales: Sale[];
  onDataRestored: (users: User[], sales: Sale[]) => void;
}

export const GoogleDriveBanner: React.FC<GoogleDriveBannerProps> = ({
  users,
  sales,
  onDataRestored,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await readDatabaseJsonFile(file);
      if (data.users && data.sales) {
        onDataRestored(data.users, data.sales);
      }
    } catch (err) {
      alert('Error: el archivo seleccionado no es un respaldo válido.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border-b border-cyan-500/20 px-4 py-2 sm:px-6 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Google Drive Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
            <FolderOpen className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Carpeta Google Drive:</span>
                <span className="text-cyan-300 font-mono text-[11px] font-medium bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                  Folder: {GOOGLE_DRIVE_FOLDER_ID.substring(0, 10)}...
                </span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                Almacenamiento Google Drive Activo
              </span>
            </div>
            <p className="text-[11px] text-slate-300 truncate mt-0.5">
              Al abrir este sistema desde cualquier computadora remota con internet, las ventas y asesores se mantienen sincronizados automáticamente y vinculados a tu carpeta de Google Drive.
            </p>

          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 self-start md:self-center shrink-0 flex-wrap">
          {/* Link to Open Drive Folder */}
          <a
            href={GOOGLE_DRIVE_FOLDER_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="Abrir carpeta compartida en Google Drive"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Abrir Carpeta Drive</span>
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
          </a>

          {/* Export JSON for Drive */}
          <button
            onClick={() => downloadDatabaseJson(users, sales)}
            title="Descargar base de datos completa en JSON para almacenar en Google Drive"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <FileJson className="w-3.5 h-3.5 text-amber-400" />
            <span>Descargar JSON</span>
          </button>

          {/* Export CSV for Drive */}
          <button
            onClick={() => downloadDatabaseCsv(sales)}
            title="Descargar reporte comercial en formato Excel/CSV para Google Drive"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Reporte Excel</span>
          </button>

          {/* Import / Restore JSON */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Restaurar base de datos desde un archivo JSON descargado de Google Drive"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
            <span>Restaurar JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
};
