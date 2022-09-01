const message = {
  missingFields: "Missing fields in the request body",
  userExists: "A user with the provided username/email already exists",
  userNotExists: "A user with that id does not exist",
};

function checkFields(fields) {
  const missingFields = fields.filter((fields) => !fields);
  return missingFields.length;
}

module.exports = { message, checkFields };
