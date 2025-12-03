import { faker } from '@faker-js/faker';

export interface DmarcReport {
  report_metadata: {
    org_name: string;
    email: string;
    extra_contact_info: string;
    report_id: string;
    date_range: {
      begin: number;
      end: number;
    };
  };
  policy_published: {
    domain: string;
    adkim: 'r' | 's';
    aspf: 'r' | 's';
    p: 'none' | 'quarantine' | 'reject';
    sp: 'none' | 'quarantine' | 'reject';
    pct: number;
  };
  record: Array<{
    row: {
      source_ip: string;
      count: number;
      policy_evaluated: {
        disposition: 'none' | 'quarantine' | 'reject';
        dkim: 'pass' | 'fail';
        spf: 'pass' | 'fail';
        reason?: Array<{
          type: 'forwarded' | 'sampled_out' | 'trusted_forwarder' | 'mailing_list' | 'local_policy' | 'other';
          comment?: string;
        }>;
      };
    };
    identifiers: {
      header_from: string;
      envelope_from?: string;
    };
    auth_results: {
      dkim: Array<{
        domain: string;
        result: 'pass' | 'fail';
        selector: string;
      }>;
      spf: Array<{
        domain: string;
        result: 'pass' | 'fail';
      }>;
    };
  }>;
}

export const generateDmarcReport = (domain: string, date: Date = new Date()): DmarcReport => {
  // Set date range to 24 hours ending at 'date'
  const endDate = Math.floor(date.getTime() / 1000);
  const beginDate = endDate - 86400; // 24 hours ago

  const orgName = faker.company.name();
  
  // Randomize policy
  const policies: ('none' | 'quarantine' | 'reject')[] = ['none', 'quarantine', 'reject'];
  const policy = policies[Math.floor(Math.random() * policies.length)] ?? 'none';

  // Increase record count for realism (15-50)
  const recordCount = faker.number.int({ min: 15, max: 50 });
  const records = [];

  // Realistic Selectors
  const selectors = ['default', 'google', 'mail', 'k1', 'selector1', '2023'];

  for (let i = 0; i < recordCount; i++) {
    const sourceIp = faker.internet.ipv4();
    const count = faker.number.int({ min: 1, max: 2000 });
    
    // Determine basic scenario
    const scenario = faker.helpers.weightedArrayElement([
      { weight: 70, value: 'pass' }, // 70% clean pass
      { weight: 15, value: 'fail_all' }, // 15% total failure
      { weight: 5, value: 'forwarded' }, // 5% forwarding break
      { weight: 5, value: 'mixed' }, // 5% mixed results
      { weight: 5, value: 'override' }, // 5% local policy override
    ]);

    let dkimResult: 'pass' | 'fail' = 'pass';
    let spfResult: 'pass' | 'fail' = 'pass';
    let disposition: 'none' | 'quarantine' | 'reject' = 'none';
    let reasons: DmarcReport['record'][0]['row']['policy_evaluated']['reason'] = [];
    let envelopeFrom = domain;

    switch (scenario) {
      case 'pass':
        dkimResult = 'pass';
        spfResult = 'pass';
        disposition = 'none';
        break;
      case 'fail_all':
        dkimResult = 'fail';
        spfResult = 'fail';
        disposition = policy; // Apply policy on failure
        break;
      case 'forwarded':
        dkimResult = 'pass'; // DKIM often survives forwarding
        spfResult = 'fail'; // SPF often breaks
        disposition = 'none'; // Usually DMARC passes if one aligns
        // Add reason if policy would have applied but didn't, or just to note it
        // Actually, if one aligns (DKIM), disposition is 'none' and no reason strictly needed for override,
        // but we can add a "forwarded" type if we want to simulate a known forwarder scenario where maybe both failed?
        // Let's simulate a case where both fail due to forwarding but we override? 
        // Or just standard forwarding where SPF breaks.
        reasons.push({
            type: 'forwarded',
            comment: 'Message via forwarding service'
        });
        // Change envelope from to unrelated domain
        envelopeFrom = faker.internet.domainName();
        break;
      case 'mixed':
        dkimResult = 'fail';
        spfResult = 'pass';
        disposition = 'none'; // One pass = pass
        break;
      case 'override':
        dkimResult = 'fail';
        spfResult = 'fail';
        disposition = 'none'; // Override strict policy
        reasons.push({
          type: 'local_policy',
          comment: 'Trusted partner override'
        });
        break;
    }

    // Construct record
    records.push({
      row: {
        source_ip: sourceIp,
        count: count,
        policy_evaluated: {
          disposition: disposition,
          dkim: dkimResult,
          spf: spfResult,
          reason: reasons.length > 0 ? reasons : undefined,
        },
      },
      identifiers: {
        header_from: domain,
        envelope_from: envelopeFrom !== domain ? envelopeFrom : undefined
      },
      auth_results: {
        dkim: [
          {
            domain: domain,
            result: dkimResult,
            selector: faker.helpers.arrayElement(selectors),
          },
        ],
        spf: [
          {
            domain: envelopeFrom, // SPF checks envelope sender
            result: spfResult,
          },
        ],
      },
    });
  }

  return {
    report_metadata: {
      org_name: orgName,
      email: `dmarc@${faker.internet.domainName()}`,
      extra_contact_info: `http://${faker.internet.domainName()}/dmarc`,
      report_id: faker.string.uuid(),
      date_range: {
        begin: beginDate,
        end: endDate,
      },
    },
    policy_published: {
      domain: domain,
      adkim: 'r',
      aspf: 'r',
      p: policy,
      sp: policy,
      pct: 100,
    },
    record: records,
  };
};
