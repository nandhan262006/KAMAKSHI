import { createClient } from "@libsql/client";
import { ListBucketsCommand, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";

const url = process.env.TURSO_DATABASE_URL;
const token = process.env.TURSO_AUTH_TOKEN;

const turso = createClient({ url, authToken: token });
const res = await turso.execute("SELECT 1 AS ok");
console.log("Turso OK:", res.rows[0]);

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const buckets = await s3.send(new ListBucketsCommand({}));
const names = buckets.Buckets?.map((b) => b.Name) ?? [];
console.log("R2 buckets:", names);

const bucket = process.env.R2_BUCKET;
await s3.send(new PutObjectCommand({ Bucket: bucket, Key: "cms-test/hello.txt", Body: "hello kamakshi", ContentType: "text/plain" }));
const fetched = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: "cms-test/hello.txt" }));
console.log("R2 put/get OK:", await fetched.Body.transformToString());
const pub = await fetch(`${process.env.R2_PUBLIC_BASE_URL}/cms-test/hello.txt`);
console.log("R2 public fetch:", pub.status, pub.ok ? await pub.text() : "");
await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: "cms-test/hello.txt" }));
console.log("R2 delete OK");
