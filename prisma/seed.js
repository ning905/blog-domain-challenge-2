const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const user = await createUser();
  const post = await createPost(user);
  createLinkedComment(user, post);
}

async function createUser() {
  const user = await prisma.user.create({
    data: {
      username: "coffeebean",
      email: "coffeebean@gmail.com",
      password: "coffeebeanPassword",
      profile: {
        create: {
          firstName: "Coffee",
          lastName: "Bean",
          age: 2,
          pictureUrl:
            "https://www.istockphoto.com/photo/coffee-bean-isolated-on-white-background-gm692855610-127883049",
        },
      },
    },
    include: {
      profile: true,
    },
  });

  console.log("User created: " + JSON.stringify(user));

  return user;
}

async function createPost(user) {
  const post = await prisma.post.create({
    data: {
      title: "Coffeebean posted",
      content: "This is a post.",
      imageUrl: "https://www.starbucks.com",
      publishedAt: new Date(),
      user: { connect: { id: user.id } },
      categories: {
        create: [{ name: "first-post" }, { name: "personal" }],
      },
      comments: {
        create: [
          { content: "Sounds good!", user: { connect: { id: user.id } } },
          { content: "Love it!", user: { connect: { id: user.id } } },
        ],
      },
    },
    include: {
      user: true,
      categories: true,
      comments: true,
    },
  });
  console.log("Post created: " + JSON.stringify(post));
  return post;
}

async function createLinkedComment(user, post) {
  const parent = await prisma.comment.create({
    data: {
      content: "This is a parent comment.",
      user: { connect: { id: user.id } },
      post: { connect: { id: post.id } },
    },
  });
  console.log("Parent comment created: " + JSON.stringify(parent));

  const child = await prisma.comment.create({
    data: {
      content: "This is a child comment.",
      parent: { connect: { id: parent.id } },
      user: { connect: { id: user.id } },
      post: { connect: { id: post.id } },
    },
  });
  console.log("Child comment created: " + JSON.stringify(child));
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
