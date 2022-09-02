const { PrismaClient, Prisma } = require("@prisma/client");
const prisma = new PrismaClient();
const { checkMissingFields, message } = require("./utils");

const getCategories = async (req, res) => {
  const categories = await prisma.category.findMany({});

  res.status(200).json({ categories });
};

const createCategory = async (req, res) => {
  const { name } = req.body;

  if (checkMissingFields([name])) {
    return res.status(400).json({ error: message.missingFields });
  }

  try {
    const category = await prisma.category.create({
      data: { name },
    });

    res.status(201).json({ category });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        return res.status(409).json({ error: message.categoryExists });
      }
    }

    res.json({ error: err });
  }
};

const updateCategory = async (req, res) => {
  const id = Number(req.params.id);
  const { name } = req.body;

  if (checkMissingFields([name])) {
    return res.status(400).json({ error: message.missingFields });
  }

  const found = await prisma.category.findUnique({
    where: { id },
  });
  if (!found) {
    return res.status(404).json({ error: message.categoryNotExists });
  }

  try {
    const category = await prisma.category.update({
      where: { id },
      data: { name },
    });

    res.status(201).json({ category });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        return res.status(409).json({ error: message.categoryExists });
      }
    }
  }
};

const deleteCategory = async (req, res) => {
  const id = Number(req.params.id);

  try {
    const category = await prisma.category.delete({
      where: { id },
    });

    res.status(201).json({ category });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        return res.status(409).json({ error: message.categoryNotExists });
      }
    }
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
