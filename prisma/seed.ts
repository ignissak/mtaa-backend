import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function toBase64(filePath: string) {
  const imagePath = path.join(__dirname, filePath);
  const image = fs.readFileSync(imagePath);
  return Buffer.from(image);
}

async function main() {
  const bratislavaCastleImage = toBase64('./assets/bratislava_castle.jpg');

  const bratislavaCastle = await prisma.place.upsert({
    where: { name: 'Bratislavský hrad' },
    update: {},
    create: {
      name: 'Bratislavský hrad',
      description:
        'Bratislavský hrad je súbor stavieb v historickom areáli, ktorý zaberá vrchol návršia na juhozápadnom ostrohu malokarpatského chrbta na ľavom brehu Dunaja v Bratislave. Hradu dominuje monumentálna stavba bývalého kráľovského paláca tvoriaca neodmysliteľnú panorámu hlavného mesta Slovenska. Svojím zástojom v dejinách Veľkej Moravy, Uhorska, Česko-Slovenska a moderného Slovenska predstavuje Bratislavský hrad významný pamätník spoločensko-historického vývoja v tejto oblasti. ',
      latitude: 48.14221557240078,
      longitude: 17.10021103662275,
      points: 10,
      type: 'CASTLE',
      images: {
        create: {
          data: await bratislavaCastleImage,
          fileName: 'bratislava-castle.jpg',
        },
      },
    },
  });

  const presidentialPalaceImage = toBase64('./assets/presidential_palace.jpg');

  const presidentialPalace = await prisma.place.upsert({
    where: { name: 'Prezidentský palác' },
    update: {},
    create: {
      name: 'Prezidentský palác',
      description:
        'Primaciálny palác je klasicistická palácová stavba na Primaciálnom námestí v Bratislave, niekdajšie sídlo ostrihomského arcibiskupa, najvýznamnejšia architektonická pamiatka uvedeného slohového obdobia v meste. Dnes je palác sídlom primátora hlavného mesta Bratislavy; niektoré jeho časti slúžia expozícii Galérie mesta Bratislavy. ',
      latitude: 48.14906814208894,
      longitude: 17.107696964087488,
      points: 5,
      type: 'OTHER',
      images: {
        create: {
          fileName: 'presidential_palace.jpg',
          data: await presidentialPalaceImage,
        },
      },
    },
  });

  const slavinImage = toBase64('./assets/slavin.jpg');

  const slavin = await prisma.place.upsert({
    where: { name: 'Slavín' },
    update: {},
    create: {
      name: 'Slavín',
      description:
        'Slavín je Bratislavský pamätník sovietskych vojakov padlých počas druhej svetovej vojny na území západného Slovenska. Spolu s cintorínom padlých v prvej svetovej vojne v Petržalke predstavuje jediný vojenský cintorín v Bratislave.',
      latitude: 48.15389840609625,
      longitude: 17.09970562184009,
      points: 10,
      type: 'OTHER',
      images: {
        create: {
          fileName: 'slavin.jpg',
          data: await slavinImage,
        },
      },
    },
  });

  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      name: 'Alice',
      password: '$2b$10$53ZZpDk.1FVFt4TZxgrZ/OoAmE4StOiztI0z5muDNjsWfjw8Kujj.',
      points: 25,
      visited: {
        createMany: {
          data: [
            {
              placeId: bratislavaCastle.id,
            },
            {
              placeId: presidentialPalace.id,
            },
            {
              placeId: slavin.id,
            },
          ],
        },
      },
    },
  });

  const john = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      email: 'john@example.com',
      name: 'John',
      password: '$2b$10$53ZZpDk.1FVFt4TZxgrZ/OoAmE4StOiztI0z5muDNjsWfjw8Kujj.',
      points: 15,
      visited: {
        createMany: {
          data: [
            {
              placeId: bratislavaCastle.id,
            },
            {
              placeId: presidentialPalace.id,
            },
          ],
        },
      },
    },
  });

  console.log({ bratislavaCastle, presidentialPalace, slavin, alice, john });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })

  .catch(async (e) => {
    console.error(e);

    await prisma.$disconnect();

    process.exit(1);
  });
