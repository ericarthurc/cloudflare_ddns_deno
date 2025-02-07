// pheynnx
// June 25, 2024
// v0.2

import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { format } from "https://deno.land/std@0.91.0/datetime/mod.ts";

const env = await load({ envPath: `${import.meta.dirname}/.env` });

type DNSRecord = {
  ip: string;
  id: string;
};

// Get initial A record, and return its id and set ip address
async function getCloudflareDNSRecord(): Promise<DNSRecord> {
  const req = new Request(
    `https://api.cloudflare.com/client/v4/zones/${env["ZONE_ID"]}/dns_records?type=A&name=${env["RECORD_NAME"]}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Auth-Email": env["AUTH_EMAIL"],
        "X-Auth-Key": env["API_TOKEN"],
      },
    }
  );

  try {
    const res = await fetch(req);
    const data = await res.json();

    return {
      ip: data.result[0].content,
      id: data.result[0].id,
    };
  } catch (error) {
    throw new Error(error);
  }
}

// Update DNS record's content by id
async function updateCloudflareDNSRecordIP(
  recordId: string,
  updatedPublicIP: string
) {
  const req = new Request(
    `https://api.cloudflare.com/client/v4/zones/${env["ZONE_ID"]}/dns_records/${recordId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-Auth-Email": env["AUTH_EMAIL"],
        "X-Auth-Key": env["API_TOKEN"],
      },
      body: JSON.stringify({ content: updatedPublicIP }),
    }
  );

  try {
    const res = await fetch(req);
    const data = await res.json();

    // check if cloudflare sent back and failure
    if (!data.success) {
      throw new Error();
    }

    return data;
  } catch (error) {
    throw new Error(error);
  }
}

// Get current public ip address
async function getPublicIP(): Promise<string> {
  try {
    // const res = await fetch("https://domains.google.com/checkip");
    const res = await fetch("https://api.ipify.org");
    return (await res.text()).trimEnd();
  } catch (_error) {
    const res = await fetch("https://icanhazip.com");
    return (await res.text()).trimEnd();
  }
}

async function mailer(publicIp: string) {
  const client = new SMTPClient({
    connection: {
      hostname: env["SMTP_HOST"],
      port: 465,
      tls: true,
      auth: {
        username: env["SMTP_USERNAME"],
        password: env["SMTP_PASSWORD"],
      },
    },
  });
  await client.send({
    from: `${env["SMTP_USERNAME"]}@${env["SMTP_HOST"]}`,
    to: env["SMTP_RECIPIENT"],
    subject: `Cloudflare DNS record updated: ${format(
      new Date(),
      "yyyy-MM-dd HH:mm:ss"
    )}`,
    content: `DNS record updated to ip: ${publicIp}`,
  });
  await client.close();
}

async function main() {
  try {
    const DNSRecord = await getCloudflareDNSRecord();
    const publicIP = await getPublicIP();

    if (DNSRecord.ip !== publicIP) {
      await updateCloudflareDNSRecordIP(DNSRecord.id, publicIP);
      // mailer(publicIP);
      console.log(
        `${format(
          new Date(),
          "yyyy-MM-dd HH:mm:ss"
        )} | DNS record updated to ${publicIP}`
      );
      Deno.exit();
    }
    console.log(`${format(new Date(), "yyyy-MM-dd HH:mm:ss")} | no change`);
  } catch (_error) {
    throw new Error("something threw an error, go figure it out");
  }
}
await main();
