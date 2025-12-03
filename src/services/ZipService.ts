import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { generateDmarcReport } from './DmarcGenerator';
import { jsonToXml } from './XmlBuilder';

export const generateAndDownloadZip = async (
  domain: string,
  count: number,
  type: 'days' | 'reports'
): Promise<void> => {
  const zip = new JSZip();
  const folder = zip.folder(`${domain}_dmarc_reports`);
  
  if (!folder) {
    throw new Error('Failed to create zip folder');
  }

  const now = new Date();

  for (let i = 0; i < count; i++) {
    const date = new Date(now);
    
    if (type === 'days') {
      // 1 report per day going back from today
      date.setDate(date.getDate() - i);
    } else {
      // Random day in the last 30 days for "reports" mode
      // This ensures variety if they ask for 10 reports
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    }

    const report = generateDmarcReport(domain, date);
    const xml = jsonToXml(report);
    
    // Filename: org_name!domain!start!end.xml
    // Use a random suffix if multiple reports might land on same day/range to prevent overwrite?
    // But DMARC spec says filename usually includes range.
    // If we generate multiple reports for same day/range, filenames might collide.
    // Let's append a UUID or counter if needed, or rely on uniqueness of range/org.
    // For now, with random dates, collision is possible but low for small counts. 
    // However, if type='reports' and we hit same day, we overwrite.
    // Let's append a random string or index to filename to be safe.
    const filename = `${report.report_metadata.org_name}!${report.policy_published.domain}!${report.report_metadata.date_range.begin}!${report.report_metadata.date_range.end}!${i}.xml`;
    
    folder.file(filename, xml);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `${domain}_dmarc_reports.zip`);
};
