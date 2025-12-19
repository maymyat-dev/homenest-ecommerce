import { PrismaClient, Prisma } from "../generated/prisma";
import * as bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';

// const prisma = new PrismaClient();

export function createRandomUser() {
    return {
      phone: faker.phone.number({style: 'international'}),
      password: "",
      randToken: faker.internet.jwt(),
    };
  }
  
  export const users = faker.helpers.multiple(createRandomUser, {
    count: 10,
  });


//   {
//     phone: "1234567891",
//     password: "",
//     randToken: "sfrwerwehfdsaoiwr45345fndsapifoenwrew",
//   },
//   {
//     phone: "1234567892",
//     password: "",
//     randToken: "sfrwerwehfdsaoiwr45345fndsapifoenwrew",
//   },
//   {
//     phone: "1234567893",
//     password: "",
//     randToken: "sfrwerwehfdsaoiwr45345fndsapifoenwrew",
//   },
//   {
//     phone: "1234567894",
//     password: "",
//     randToken: "sfrwerwehfdsaoiwr45345fndsapifoenwrew",
//   },
//   {
//     phone: "1234567895",
//     password: "",
//     randToken: "sfrwerwehfdsaoiwr45345fndsapifoenwrew",
//   },
// ];

async function main() {
  console.log(`Starting seed...`);
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash("12345678", salt);
  for (const u of users) {
    u.password = password;
    await prisma.user.create({ data: u });
  }
  console.log(`Seeding finished.`);

  console.log(`Seeding products...`);
  // const products = [
  //   {
  //     name: "Modern Sofa",
  //     price: 550,
  //     description: "Comfortable and stylish modern sofa",
  //     image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
  //   },
  //   {
  //     name: "Wooden Dining Table",
  //     price: 320,
  //     description: "Solid oak wood dining table",
  //     image: "https://images.unsplash.com/photo-1577142217060-23914194bd61",
  //   },
  //   {
  //     name: "Ergonomic Chair",
  //     price: 180,
  //     description: "Perfect for long working hours",
  //     image: "https://images.unsplash.com/photo-1505797149-35ebcb05a6fd",
  //   }
  // ];
  
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
