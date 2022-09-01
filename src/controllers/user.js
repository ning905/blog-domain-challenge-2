const { PrismaClient, Prisma } = require("@prisma/client");
const { checkFields, message } = require("./utils");
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

module.exports = { createUser, updateUser, deleteUser };
