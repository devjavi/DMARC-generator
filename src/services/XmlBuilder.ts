import type { DmarcReport } from './DmarcGenerator';

const escapeXml = (unsafe: string | number): string => {
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

export const jsonToXml = (report: DmarcReport): string => {
  let xml = '<?xml version="1.0" encoding="UTF-8" ?>\n';
  xml += '<feedback>\n';

  // Report Metadata
  xml += '  <report_metadata>\n';
  xml += `    <org_name>${escapeXml(report.report_metadata.org_name)}</org_name>\n`;
  xml += `    <email>${escapeXml(report.report_metadata.email)}</email>\n`;
  xml += `    <extra_contact_info>${escapeXml(report.report_metadata.extra_contact_info)}</extra_contact_info>\n`;
  xml += `    <report_id>${escapeXml(report.report_metadata.report_id)}</report_id>\n`;
  xml += '    <date_range>\n';
  xml += `      <begin>${escapeXml(report.report_metadata.date_range.begin)}</begin>\n`;
  xml += `      <end>${escapeXml(report.report_metadata.date_range.end)}</end>\n`;
  xml += '    </date_range>\n';
  xml += '  </report_metadata>\n';

  // Policy Published
  xml += '  <policy_published>\n';
  xml += `    <domain>${escapeXml(report.policy_published.domain)}</domain>\n`;
  xml += `    <adkim>${escapeXml(report.policy_published.adkim)}</adkim>\n`;
  xml += `    <aspf>${escapeXml(report.policy_published.aspf)}</aspf>\n`;
  xml += `    <p>${escapeXml(report.policy_published.p)}</p>\n`;
  xml += `    <sp>${escapeXml(report.policy_published.sp)}</sp>\n`;
  xml += `    <pct>${escapeXml(report.policy_published.pct)}</pct>\n`;
  xml += '  </policy_published>\n';

  // Records
  report.record.forEach(record => {
    xml += '  <record>\n';
    xml += '    <row>\n';
    xml += `      <source_ip>${escapeXml(record.row.source_ip)}</source_ip>\n`;
    xml += `      <count>${escapeXml(record.row.count)}</count>\n`;
    xml += '      <policy_evaluated>\n';
    xml += `        <disposition>${escapeXml(record.row.policy_evaluated.disposition)}</disposition>\n`;
    xml += `        <dkim>${escapeXml(record.row.policy_evaluated.dkim)}</dkim>\n`;
    xml += `        <spf>${escapeXml(record.row.policy_evaluated.spf)}</spf>\n`;
    xml += '      </policy_evaluated>\n';
    xml += '    </row>\n';
    xml += '    <identifiers>\n';
    xml += `      <header_from>${escapeXml(record.identifiers.header_from)}</header_from>\n`;
    xml += '    </identifiers>\n';
    xml += '    <auth_results>\n';
    
    record.auth_results.dkim.forEach(dkim => {
      xml += '      <dkim>\n';
      xml += `        <domain>${escapeXml(dkim.domain)}</domain>\n`;
      xml += `        <result>${escapeXml(dkim.result)}</result>\n`;
      xml += `        <selector>${escapeXml(dkim.selector)}</selector>\n`;
      xml += '      </dkim>\n';
    });

    record.auth_results.spf.forEach(spf => {
      xml += '      <spf>\n';
      xml += `        <domain>${escapeXml(spf.domain)}</domain>\n`;
      xml += `        <result>${escapeXml(spf.result)}</result>\n`;
      xml += '      </spf>\n';
    });

    xml += '    </auth_results>\n';
    xml += '  </record>\n';
  });

  xml += '</feedback>';
  return xml;
};
