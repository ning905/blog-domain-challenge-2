const { PrismaClient, Prisma } = require("@prisma/client");
const {
  checkFields,
  message,
  buildCreateOrConnectClause,
  convertPostTime,
  getUserPosts,
  userOwnPost,
  buildUpdateCategoryClause,
} = require("./utils");
const prisma = new PrismaClient();

const createUser = async (req, res) => {
  const { username, email, password, firstName, lastName, age, pictureUrl } =
    req.body;

  if (
    checkFields([
      username,
      email,
      password,
      firstName,
      lastName,
      age,
      pictureUrl,
    ])
  ) {
    return res.status(400).json({ error: message.missingFields });
  }

  try {
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password,
        profile: {
          create: {
            firstName,
            lastName,
            age,
            pictureUrl,
          },
        },
      },
      include: { profile: true },
    });

    res.status(201).json({ user: user });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        return res.status(409).json({ error: message.userExists });
      }
    }

    res.json({ error: err });
  }
};

const updateUser = async (req, res) => {
  const { username, email, password, firstName, lastName, age, pictureUrl } =
    req.body;

  try {
    const user = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: {
        username,
        email,
        password,
        profile: {
          update: {
            firstName,
            lastName,
            age,
            pictureUrl,
          },
        },
      },
      include: { profile: true },
    });
    console.log(user);
    res.status(201).json({ user });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: message.userNotExists });
      }
      if (err.code === "P2002") {
        return res.status(409).json({ error: message.userExists });
      }
    }

    res.json({ error: err });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await prisma.user.delete({
      where: { id: Number(req.params.id) },
      include: { profile: true },
    });
    res.status(201).json({ user });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: message.userNotExists });
      }
    }

    res.json({ error: err });
  }
};

const createPost = async (req, res) => {
  const userId = Number(req.params.userId);
  convertPostTime(req.body);
  const { title, content, imageUrl, publishedAt, categories } = req.body;

  if (checkFields([title, content, imageUrl, publishedAt, categories])) {
    return res.status(400).json({ error: message.missingFields });
  }

  try {
    const post = await prisma.post.create({
      data: {
        title,
        content,
        imageUrl,
        publishedAt,
        author: {
          connect: { id: userId },
        },
        categories: {
          connectOrCreate: buildCreateOrConnectClause(categories),
        },
      },
      include: {
        author: true,
        comments: true,
        categories: true,
      },
    });

    res.status(201).json({ post });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: message.userNotExists });
      }
      if (err.code === "P2002") {
        return res.status(409).json({ error: message.postExists });
      }
    }

    res.json({ error: err });
  }
};

const getPosts = async (req, res) => {
  const userId = Number(req.params.userId);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return res.status(404).json({ error: message.userNotExists });
  }

  const posts = await getUserPosts(userId);
  res.status(200).json({ posts });
};

const updatePost = async (req, res) => {
  const userId = Number(req.params.userId);
  const postId = Number(req.params.postId);
  convertPostTime(req.body);
  const { title, content, imageUrl, publishedAt, categories } = req.body;

  const userPosts = await getUserPosts(userId);
  if (!userOwnPost(userPosts, postId)) {
    return res.status(404).json({ error: message.userOrPostNotExists });
  }

  try {
    const findPost = await prisma.post.findUnique({ where: { id: postId } });
    const categoriesUpdateClause = buildUpdateCategoryClause(
      findPost,
      categories
    );
    console.log(JSON.stringify(categoriesUpdateClause));

    const post = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        title,
        content,
        imageUrl,
        publishedAt,
        categories: categoriesUpdateClause,
      },
      include: {
        author: true,
        comments: true,
        categories: true,
      },
    });

    res.status(201).json({ post });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        return res.status(409).json({ error: message.postExists });
      }
    }

    console.log(err);
    res.json({ error: err });
  }
};

module.exports = {
  createUser,
  updateUser,
  deleteUser,
  createPost,
  getPosts,
  updatePost,
};
