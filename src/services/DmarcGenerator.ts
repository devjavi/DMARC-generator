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
      };
    };
    identifiers: {
      header_from: string;
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

  // Generate 1-10 records
  const recordCount = faker.number.int({ min: 1, max: 10 });
  const records = [];

  for (let i = 0; i < recordCount; i++) {
    const sourceIp = faker.internet.ipv4();
    const count = faker.number.int({ min: 1, max: 1000 });
    
    // Determine auth results
    const dkimResult = faker.helpers.arrayElement(['pass', 'fail'] as const);
    const spfResult = faker.helpers.arrayElement(['pass', 'fail'] as const);
    
    // Disposition depends on policy and results
    let disposition: 'none' | 'quarantine' | 'reject' = 'none';
    if (policy !== 'none' && (dkimResult === 'fail' || spfResult === 'fail')) {
       // Simple logic: if fails, apply policy (simplified)
       if (dkimResult === 'fail' && spfResult === 'fail') {
           disposition = policy;
       }
    }

    records.push({
      row: {
        source_ip: sourceIp,
        count: count,
        policy_evaluated: {
          disposition: disposition,
          dkim: dkimResult,
          spf: spfResult,
        },
      },
      identifiers: {
        header_from: domain,
      },
      auth_results: {
        dkim: [
          {
            domain: domain,
            result: dkimResult,
            selector: faker.lorem.word(),
          },
        ],
        spf: [
          {
            domain: domain,
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
