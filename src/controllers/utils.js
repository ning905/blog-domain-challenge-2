const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const message = {
  missingFields: "Missing fields in the request body",
  userExists: "A user with the provided username/email already exists",
  userNotExists: "A user with that id does not exist",
  postExists: "A post with the provided title already exists",
  userOrPostNotExists: "User / post does not exist",
};

function checkFields(fields) {
  const missingFields = fields.filter((fields) => !fields);
  return missingFields.length;
}

function convertPostTime(post) {
  post.time = new Date(post.time);
}

function buildCreateOrConnectClause(records) {
  const clause = [];
  for (const record of records) {
    const thisClause = {
      where: record,
      create: record,
    };
    clause.push(thisClause);
  }
  return clause;
}

async function getUserPosts(userId) {
  const posts = await prisma.post.findMany({
    where: { authorId: userId },
    include: {
      author: true,
      comments: true,
      categories: true,
    },
  });
  return posts;
}

function userOwnPost(userPosts, postId) {
  for (let post of userPosts) {
    if (post.id === postId) {
      return true;
    }
  }
  return false;
}

function buildUpdateCategoryClause(post, newCategories) {
  const clause = {
    disconnect: [],
    connectOrCreate: [],
  };
  console.log("post :", post);
  let existingCategories = [];
  if (post.categories) {
    existingCategories = post.categories.map((category) => category.name);
  }
  console.log("existing categories :", existingCategories);

  for (const category of newCategories) {
    if (existingCategories.includes(category.name)) {
      const thisClause = { name: category.name };
      clause.disconnect.push(thisClause);
    } else {
      const thisClause = {
        where: { name: category.name },
        create: { name: category.name },
      };
      clause.connectOrCreate.push(thisClause);
    }
  }
  return clause;
}

module.exports = {
  message,
  checkFields,
  convertPostTime,
  buildCreateOrConnectClause,
  getUserPosts,
  userOwnPost,
  buildUpdateCategoryClause,
};
