import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient().$extends({
  result: {
    user: {
      fullName: {
        needs: { firstName: true, lastName: true },
        compute(user) {
          return `${user.firstName} ${user.lastName}`;
        },
      },
      image: {
        needs: { image: true },
        compute(user) {
          if (!user.image) return user.image;

      
          const fileName = user.image.split(".")[0];
          return `/optimize/${fileName}.webp`;
        },
      },
    },
    post: {
      image: {
        needs: { image: true },
        compute(post) {
          if (!post.image) return post.image;

      
          if (post.image.includes("res.cloudinary.com")) {
            return post.image.replace("/upload/", "/upload/q_auto,f_auto/");
          }

        
          return "/optimize/" + post.image;
        },
      },
      updatedAt: {
        needs: { updatedAt: true },
        compute(post) {
          return post.updatedAt.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        },
      },
    },
    image: {
      path: {
        needs: { path: true },
        compute(image) {
          if (!image.path) return image.path;
         
          if (image.path.includes("res.cloudinary.com")) {
            return image.path.replace("/upload/", "/upload/q_auto,f_auto/");
          }
          return "/optimize/" + image.path;
        },
      },
    },
  },
});