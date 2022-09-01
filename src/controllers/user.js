const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createUser = async (req, res) => {
  const { username, email, password, firstName, lastName, age, pictureUrl } =
    req.body;

  const user = await prisma.user.create({
    data: {},
  });

  res.json({ user: "ok" });
};

module.exports = { createUser };
