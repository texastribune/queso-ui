import { docsImages } from '../paths';

const { createCanvas, Image, registerFont } = require('canvas');
const fs = require('fs-extra');
const ora = require('ora');
const path = require('path');

const bugHeight = 35;
const bugWidth = 30;
const bug = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 174.9 200" width="${bugWidth}" height="${bugHeight}"><path fill="#ffc200" d="M0 0v200l40.2-25.1h134.6V0H0zm125.2 139.7l-38.3-25.2-38.3 25.2 12.1-44.2L25 66.8l45.8-2.1L87 21.8l16.2 42.9 45.8 2.1-35.8 28.6 12 44.3z"/></svg>`;
registerFont('./assets/fonts/OpenSans-Bold.ttf', {
  family: 'Open Sans Bold',
});

interface Watermark {
  year: Number;
  imagePath: string;
}

const watermarkDir = path.join(docsImages, 'watermarks', '/');

async function createWatermark(year: Number): Promise<Watermark> {
  const width = 200;
  const height = 50;

  const canvas = createCanvas(width, height);
  const context = canvas.getContext('2d');
  context.fillStyle = '#222';
  context.fillRect(0, 0, width, height);
  context.font = 'bold 16px Open Sans Bold';
  context.fillStyle = '#fff';
  const text = `Published ${year}`;
  context.textBaseline = 'middle';
  context.textAlign = 'left';
  context.fillText(text, bugWidth + 20, canvas.height / 2);

  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${bug}`;
  context.drawImage(img, 10, canvas.height / 2 - bugHeight / 2);
  const buffer = canvas.toBuffer('image/png');
  const imagePath = `${watermarkDir}${year}.png`;
  fs.outputFile(imagePath, buffer);
  return {
    year,
    imagePath,
  };
}

async function build() {
  const spinner = ora('Generating watermark images').start();
  const now = new Date().getUTCFullYear();
  const years = Array(now - 1998)
    .fill('')
    .map((v, idx) => now - idx) as Array<number>;
  const watermarks = await Promise.all(
    years.map((year: Number) => createWatermark(year))
  );
  spinner.succeed();
  return watermarks;
}

build().catch((err) => {
  // eslint-disable-next-line no-console
  console.log(err);
  process.exit(1);
});
