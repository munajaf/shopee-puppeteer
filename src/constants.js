import dotenv from 'dotenv';

dotenv.config();

// since the env i gave is a string, we need to convert it to boolean by comparing it to 'true'
export const ENABLE_ROTATE_PROXY = process.env.ENABLE_ROTATE_PROXY === 'true'
export const PROXY_URL = process.env.PROXY_URL;
export const PROXY_USERNAME = process.env.PROXY_USERNAME;
export const PROXY_PASSWORD = process.env.PROXY_PASSWORD;

export const PRODUCT_PAGE = process.env.PRODUCT_PAGE;

export const PUPPETEER_ARGUMENTS = [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-accelerated-2d-canvas",
    "--no-first-run",
    "--no-zygote",
    "--single-process",
    "--disable-gpu",
    ENABLE_ROTATE_PROXY ? `--proxy-server=${PROXY_URL}` : "",
]