import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
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
      type: 'CASTLES',
      images: {
        createMany: {
          data: [
            {
              fileName: 'bratislava_castle.jpg',
            },
            {
              fileName: 'bratislava_castle2.jpg',
            },
          ],
        },
      },
    },
  });

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
        },
      },
    },
  });

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
        },
      },
    },
  });

  const bratislavaZoo = await prisma.place.upsert({
    where: { name: 'Bratislavská zoologická záhrada' },
    update: {},
    create: {
      name: 'Bratislavská zoologická záhrada',
      description:
        'Bratislavská zoologická záhrada je zoologická záhrada v Bratislave, ktorá sa nachádza v mestskej časti Karlova Ves. Záhrada je rozlohou najväčšou zoologickou záhradou na Slovensku. ',
      latitude: 48.15673311620213,
      longitude: 17.075690661292583,
      points: 5,
      type: 'OTHER',
      images: {
        create: {
          fileName: 'bratislava_zoo.jpg',
        },
      },
    },
  });

  const cathedralMartin = await prisma.place.upsert({
    where: { name: 'Dóm svätého Martina' },
    update: {},
    create: {
      name: 'Dóm svätého Martina',
      description:
        'Dóm svätého Martina je rímskokatolícky kostol v Bratislave, ktorý je sídlom bratislavského arcibiskupa. ',
      latitude: 48.14217843442503,
      longitude: 17.104972961343652,
      points: 5,
      type: 'OTHER',
      images: {
        create: {
          fileName: 'cathedral_martin.jpg',
        },
      },
    },
  });

  const horskyPark = await prisma.place.upsert({
    where: { name: 'Horský park' },
    update: {},
    create: {
      name: 'Horský park',
      description:
        'Malebný park na úbočí založený v 19. storočí ponúka chodníky v dubovom lese, ihrisko a kaviareň.',
      latitude: 48.158071300776406,
      longitude: 17.09067060514125,
      points: 5,
      type: 'PARKS_AND_GARDENS',
      images: {
        create: {
          fileName: 'horsky_park.jpg',
        },
      },
    },
  });

  const kralovaHola = await prisma.place.upsert({
    where: { name: 'Kráľova hola' },
    update: {},
    create: {
      name: 'Kráľova hola',
      description:
        'Krížna je 1574 m n. m. vysoký vrch v Nízkych Tatrách na Slovensku. ',
      latitude: 48.161626645219236,
      longitude: 17.03530026392443,
      points: 10,
      type: 'OTHER',
      images: {
        create: {
          fileName: 'kralova_hola.jpg',
        },
      },
    },
  });

  const michalskaBrana = await prisma.place.upsert({
    where: { name: 'Michalská brána' },
    update: {},
    create: {
      name: 'Michalská brána',
      description:
        'Vstupná brána mestského opevnenia zo 14. storočia s múzeom zbraní a výhľadom z vrchu.',
      latitude: 48.145209683618894,
      longitude: 17.106766472415384,
      points: 5,
      type: 'OTHER',
      images: {
        create: {
          fileName: 'michalska_brana.jpg',
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
      settings: {
        create: {},
      },
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
      settings: {
        create: {},
      },
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

  const agnes = await prisma.user.upsert({
    where: { email: 'agnes@example.com' },
    update: {},
    create: {
      email: 'agnes@example.com',
      name: 'Agnes',
      password: '$2b$10$53ZZpDk.1FVFt4TZxgrZ/OoAmE4StOiztI0z5muDNjsWfjw8Kujj.',
      points: 55,
      settings: {
        create: {},
      },
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
            {
              placeId: bratislavaZoo.id,
            },
            {
              placeId: cathedralMartin.id,
            },
            {
              placeId: horskyPark.id,
            },
            {
              placeId: kralovaHola.id,
            },
            {
              placeId: michalskaBrana.id,
            },
          ],
        },
      },
    },
  });

  console.log({ slavin, alice, john, agnes });
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
