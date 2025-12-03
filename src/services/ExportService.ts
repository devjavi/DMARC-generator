import JSZip from 'jszip';
import { gzipSync } from 'fflate';
import { saveAs } from 'file-saver';
import { generateDmarcReport } from './DmarcGenerator';
import { jsonToXml } from './XmlBuilder';

export type ExportFormat = 'zip' | 'gzip';
export type GenerationMode = 'days' | 'reports';

interface ReportPayload {
  xml: string;
  filenameBase: string;
}

const buildReportPayload = (domain: string, date: Date): ReportPayload => {
  const report = generateDmarcReport(domain, date);
  const xml = jsonToXml(report);
  const filenameBase = `${report.report_metadata.org_name}!${report.policy_published.domain}!${report.report_metadata.date_range.begin}!${report.report_metadata.date_range.end}`;
  return { xml, filenameBase };
};

const resolveDateForIteration = (
  mode: GenerationMode,
  baseDate: Date,
  iteration: number
): Date => {
  const date = new Date(baseDate);
  if (mode === 'days') {
    date.setDate(date.getDate() - iteration);
  } else {
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
  }
  return date;
};

export const generateAndDownloadReports = async (
  domain: string,
  count: number,
  mode: GenerationMode,
  format: ExportFormat
): Promise<void> => {
  const now = new Date();

  if (format === 'gzip') {
    // GZIP reports are typically single files. We generate only the latest day.
    const reportPayload = buildReportPayload(domain, resolveDateForIteration(mode, now, 0));
    const encoder = new TextEncoder();
    const gzipped = gzipSync(encoder.encode(reportPayload.xml));
    const gzippedData = new Uint8Array(gzipped.length);
    gzippedData.set(gzipped);
    const blob = new Blob([gzippedData], { type: 'application/gzip' });
    saveAs(blob, `${reportPayload.filenameBase}.xml.gz`);
    return;
  }

  const zip = new JSZip();
  for (let i = 0; i < count; i++) {
    const reportPayload = buildReportPayload(domain, resolveDateForIteration(mode, now, i));
    const filename = `${reportPayload.filenameBase}!${i}.xml`;
    zip.file(filename, reportPayload.xml);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `${domain}_dmarc_reports.zip`);
};
