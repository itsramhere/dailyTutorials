import 'dotenv/config';
import { Client } from '@elastic/elasticsearch';

export const client = new Client({
  cloud: {
    id: process.env.ELASTIC_CLOUD_ID as string
  },
  auth: {
    username: process.env.ELASTIC_USERNAME as string,
    password: process.env.ELASTIC_PASSWORD as string
  }
});