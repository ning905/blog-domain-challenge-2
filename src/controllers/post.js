const { PrismaClient, Prisma } = require("@prisma/client");
const { updateQuery } = require("./utils");
const prisma = new PrismaClient();

const getPosts = async (req, res) => {
  const query = {
    page: 1,
    perPage: 10,
    order_by: "latest",
  };
  if (req.query) {
    updateQuery(query, req.query);
  }

  const posts = await prisma.post.findMany({
    skip: Number(query.perPage) * (Number(query.page) - 1),
    take: Number(query.perPage),
    orderBy: {
      publishedAt: query.order_by === "oldest" ? "asc" : "desc",
    },
  });

  res.status(200).json({ posts });
};

module.exports = {
  getPosts,
};
